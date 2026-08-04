"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, setSessionCookie, clearSessionCookie, hashPassword, comparePassword } from "@/lib/auth";

export async function getUserSettingsAction() {
  const user = await getCurrentUser();
  if (!user) return null;

  let settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId: user.id,
        theme: "light",
        productUpdates: true,
        analysisCompleted: true,
        weeklyTips: false,
        aiResponseLength: "Balanced",
        aiResponseStyle: "Professional",
        autoSaveChat: true,
      },
    });
  }

  return {
    theme: settings.theme,
    productUpdates: settings.productUpdates,
    analysisCompleted: settings.analysisCompleted,
    weeklyTips: settings.weeklyTips,
    aiResponseLength: settings.aiResponseLength,
    aiResponseStyle: settings.aiResponseStyle,
    autoSaveChat: settings.autoSaveChat,
  };
}

export async function updateThemeAction(theme: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const validThemes = ["light", "dark", "system"];
  if (!validThemes.includes(theme)) return { error: "Invalid theme choice" };

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { theme },
    create: { userId: user.id, theme },
  });

  revalidatePath("/dashboard/settings");
  return { success: true, message: "Theme preference saved." };
}

export async function updateNotificationsAction(data: {
  productUpdates?: boolean;
  analysisCompleted?: boolean;
  weeklyTips?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { ...data },
    create: { userId: user.id, ...data },
  });

  revalidatePath("/dashboard/settings");
  return { success: true, message: "Notification preferences saved." };
}

export async function updateAiPreferencesAction(data: {
  aiResponseLength?: string;
  aiResponseStyle?: string;
  autoSaveChat?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { ...data },
    create: { userId: user.id, ...data },
  });

  revalidatePath("/dashboard/settings");
  return { success: true, message: "AI preferences saved." };
}

export async function updateProfileNameAction(name: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name cannot be empty" };

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: trimmed },
  });

  await setSessionCookie({ id: updatedUser.id, email: updatedUser.email, name: updatedUser.name });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { success: true, message: "Profile name updated successfully." };
}

export async function updateEmailAction(newEmail: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const trimmed = newEmail.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) return { error: "Valid email address required" };

  const existing = await prisma.user.findUnique({
    where: { email: trimmed },
  });

  if (existing && existing.id !== user.id) {
    return { error: "An account with this email address already exists." };
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { email: trimmed },
  });

  await setSessionCookie({ id: updatedUser.id, email: updatedUser.email, name: updatedUser.name });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");

  return { success: true, message: "Email address updated successfully." };
}

export async function changePasswordAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { error: "Both current and new password are required." };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters long." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) return { error: "User not found." };

  const isMatch = await comparePassword(currentPassword, dbUser.password);
  if (!isMatch) {
    return { error: "Incorrect current password." };
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return { success: true, message: "Password changed successfully." };
}

export async function deleteAccountAction() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.user.delete({
    where: { id: user.id },
  });

  await clearSessionCookie();
  return { success: true };
}
