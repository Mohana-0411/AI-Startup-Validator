"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword, setSessionCookie, clearSessionCookie, getOrCreateDemoUser } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function registerAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string || "").trim();
  const name = (formData.get("name") as string || "").trim();
  const password = formData.get("password") as string || "";

  const validation = registerSchema.safeParse({ email, name, password });
  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Invalid input parameters",
    };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "An account with this email address already exists." };
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    await setSessionCookie({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    console.error("Register Error:", error);
    return { error: "Failed to create account. Please try again." };
  }

  redirect("/dashboard");
}

export async function loginAction(prevState: any, formData: FormData) {
  const rawEmail = formData.get("email") as string;
  const rawPassword = formData.get("password") as string;

  const email = (rawEmail || "").trim().toLowerCase();
  const password = rawPassword || "";

  // 1. Validation for empty email
  if (!email) {
    return {
      errorType: "EMPTY_EMAIL",
      message: "Enter your email address to continue.",
      alertLevel: "warning",
    };
  }

  // 2. Validation for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      errorType: "INVALID_EMAIL",
      message: "Please enter a valid email address.",
      alertLevel: "warning",
    };
  }

  // 3. Validation for empty password
  if (!password) {
    return {
      errorType: "EMPTY_PASSWORD",
      message: "Enter your password to continue.",
      alertLevel: "warning",
    };
  }

  try {
    // 4. Lookup user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        errorType: "ACCOUNT_NOT_FOUND",
        message: "We couldn't find an account with that email.",
        subMessage: "If you're new here, create a free account to start analyzing startup ideas.",
        showSignupCTA: true,
        alertLevel: "info",
      };
    }

    // 5. Compare password
    const passwordsMatch = await comparePassword(password, user.password);
    if (!passwordsMatch) {
      return {
        errorType: "INCORRECT_PASSWORD",
        message: "The password you entered is incorrect. Please try again or reset your password.",
        alertLevel: "error",
      };
    }

    await setSessionCookie({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    console.error("Login Error:", error);
    return {
      errorType: "GENERIC",
      message: "Something went wrong during sign in. Please try again.",
      alertLevel: "error",
    };
  }

  redirect("/dashboard");
}

export async function demoLoginAction() {
  await getOrCreateDemoUser();
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
