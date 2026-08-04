import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { SidebarNav } from "@/components/SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return <SidebarNav user={user}>{children}</SidebarNav>;
}
