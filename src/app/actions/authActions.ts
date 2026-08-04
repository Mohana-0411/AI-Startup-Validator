"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword, setSessionCookie, clearSessionCookie, getOrCreateDemoUser } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validators";

export async function registerAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

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
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Invalid credentials format",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    const passwordsMatch = await comparePassword(password, user.password);
    if (!passwordsMatch) {
      return { error: "Invalid email or password." };
    }

    await setSessionCookie({ id: user.id, email: user.email, name: user.name });
  } catch (error: any) {
    console.error("Login Error:", error);
    return { error: "Login failed. Please try again." };
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
