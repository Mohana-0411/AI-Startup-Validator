import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RoadmapView } from "./RoadmapView";

export default async function ExecutionRoadmapPage() {
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
      overallScore: true,
    },
  });

  return <RoadmapView analyses={analyses} />;
}
