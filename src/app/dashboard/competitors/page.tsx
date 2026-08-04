import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CompetitorView } from "./CompetitorView";

export default async function CompetitorInsightsPage() {
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
      solution: true,
      audience: true,
      country: true,
      businessModel: true,
      competitors: true,
      overallScore: true,
      analysisResult: true,
    },
  });

  return <CompetitorView analyses={analyses} />;
}
