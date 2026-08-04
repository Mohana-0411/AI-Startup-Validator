import type { Metadata } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AI Startup Analyzer - Instant Startup Idea Validation",
  description:
    "Validate your startup idea with YC & Sequoia partner level AI insights. Generate instant venture scorecards, SWAT matrix, and actionable execution plans.",
  keywords: ["startup analyzer", "AI startup validation", "venture capital AI", "idea score", "business model validator"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col antialiased bg-white text-slate-900 selection:bg-purple-100 selection:text-purple-900">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
