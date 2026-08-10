import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { HistoryClient } from "./HistoryClient";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      startupName: true,
      idea: true,
      problem: true,
      audience: true,
      country: true,
      businessModel: true,
      overallScore: true,
      createdAt: true,
    },
  });

  const formattedAnalyses = analyses.map((a) => ({
    id: a.id,
    startupName: a.startupName,
    idea: a.idea,
    problem: a.problem,
    audience: a.audience,
    country: a.country,
    businessModel: a.businessModel,
    overallScore: a.overallScore,
    createdAt: a.createdAt.toISOString(),
  }));

  return <HistoryClient initialAnalyses={formattedAnalyses} />;
}
