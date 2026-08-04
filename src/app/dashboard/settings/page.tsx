import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserSettingsAction } from "@/app/actions/settingsActions";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const initialSettings = (await getUserSettingsAction()) || {
    theme: "light",
    productUpdates: true,
    analysisCompleted: true,
    weeklyTips: false,
    aiResponseLength: "Balanced",
    aiResponseStyle: "Professional",
    autoSaveChat: true,
  };

  return <SettingsClient user={user} initialSettings={initialSettings} />;
}
