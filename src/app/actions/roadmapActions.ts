"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { detectStartupCategory, buildVentureContext } from "@/lib/openai";

export async function getOrCreateRoadmapAction(analysisId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const analysis = await prisma.analysis.findFirst({
    where: { id: analysisId, userId: user.id },
  });

  if (!analysis) return { error: "Analysis not found" };

  // Check if roadmap tasks already exist
  let tasks = await prisma.roadmapTask.findMany({
    where: { analysisId: analysis.id },
    orderBy: { createdAt: "asc" },
  });

  if (tasks.length === 0) {
    let parsedResult: any = null;
    try {
      parsedResult = JSON.parse(analysis.analysisResult);
    } catch {
      parsedResult = null;
    }

    const vContext = parsedResult?.ventureContext || buildVentureContext({
      startupName: analysis.startupName,
      idea: analysis.idea,
      problem: analysis.problem,
      solution: analysis.solution,
      audience: analysis.audience,
      country: analysis.country,
      businessModel: analysis.businessModel,
      competitors: analysis.competitors,
    });

    const suggestedPriorities: string[] = parsedResult?.startupLifecycle?.suggestedPriorities || [];

    let defaultDynamicTasks: {
      phase: string;
      title: string;
      description: string;
      priority: string;
      effort: string;
      impact: string;
    }[] = [];

    if (suggestedPriorities.length >= 3) {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Demand & Feasibility",
          title: suggestedPriorities[0],
          description: `Validate initial demand, location footfall, or problem severity for ${analysis.startupName}.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 2: Setup & Operational Launch",
          title: suggestedPriorities[1],
          description: `Establish core operational setup, licensing, and supplier agreements.`,
          priority: "High",
          effort: "2-3 weeks",
          impact: "High",
        },
        {
          phase: "Phase 3: Revenue & Margin Optimization",
          title: suggestedPriorities[2],
          description: `Optimize unit economics and scale paying customer acquisition in ${analysis.country}.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
      ];

      if (suggestedPriorities[3]) {
        defaultDynamicTasks.push({
          phase: "Phase 4: Operations & Expansion",
          title: suggestedPriorities[3],
          description: `Expand operational capacity, repeat customer retention, and multi-location growth.`,
          priority: "Medium",
          effort: "2-4 weeks",
          impact: "High",
        });
      }
    } else if (vContext.industry === "Food & Beverage") {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Location & Footfall Selection",
          title: `Identify 2–3 high-footfall stall locations for ${analysis.startupName}`,
          description: `Analyze evening footfall (4 PM - 8 PM) near colleges, bus stops, or commercial markets in ${analysis.country}.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
        {
          phase: "Phase 2: Cost Calculation & Menu Setup",
          title: `Calculate ingredient cost per plate & set menu pricing`,
          description: `Estimate gram flour (besan), cooking oil, green chilli, and spice cost per plate to target 65%+ gross margin.`,
          priority: "High",
          effort: "3-5 days",
          impact: "High",
        },
        {
          phase: "Phase 3: FSSAI Permitting & Stall Setup",
          title: `Secure FSSAI hygiene registration & municipal trade permit`,
          description: `Set up clean oil practices, stainless steel counter, and basic municipal permissions.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
      ];
    } else {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Feasibility & Market Demand",
          title: `Validate customer demand for ${analysis.startupName}`,
          description: `Conduct initial market interviews to confirm willingness-to-pay for ${analysis.businessModel}.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 2: Operational Launch",
          title: `Establish baseline operations for ${analysis.startupName}`,
          description: `Set up primary solution workflow and supplier pricing agreements.`,
          priority: "High",
          effort: "2-3 weeks",
          impact: "High",
        },
        {
          phase: "Phase 3: Growth & Scaling",
          title: `Scale customer acquisition & optimize unit economics`,
          description: `Expand local reach and maintain high margin retention.`,
          priority: "High",
          effort: "2-3 weeks",
          impact: "High",
        },
      ];
    }

    // Save to database
    await prisma.roadmapTask.createMany({
      data: defaultDynamicTasks.map((t) => ({
        analysisId: analysis.id,
        phase: t.phase,
        title: t.title,
        description: t.description,
        priority: t.priority,
        effort: t.effort,
        impact: t.impact,
      })),
    });

    tasks = await prisma.roadmapTask.findMany({
      where: { analysisId: analysis.id },
      orderBy: { createdAt: "asc" },
    });
  }

  return {
    tasks: tasks.map((t) => ({
      id: t.id,
      phase: t.phase,
      title: t.title,
      description: t.description,
      priority: t.priority,
      effort: t.effort,
      impact: t.impact,
      completed: t.completed,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}

export async function toggleTaskCompleteAction(taskId: string, completed: boolean, analysisId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.roadmapTask.update({
    where: { id: taskId },
    data: { completed },
  });

  revalidatePath("/dashboard/roadmap");
  return { success: true };
}

export async function createRoadmapTaskAction(data: {
  analysisId: string;
  phase: string;
  title: string;
  description: string;
  priority: string;
  effort: string;
  impact: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.roadmapTask.create({
    data: {
      analysisId: data.analysisId,
      phase: data.phase,
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority,
      effort: data.effort,
      impact: data.impact,
    },
  });

  revalidatePath("/dashboard/roadmap");
  return { success: true };
}

export async function updateRoadmapTaskAction(
  taskId: string,
  data: { title: string; description: string; priority: string; effort: string; impact: string },
  analysisId: string
) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.roadmapTask.update({
    where: { id: taskId },
    data: {
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority,
      effort: data.effort,
      impact: data.impact,
    },
  });

  revalidatePath("/dashboard/roadmap");
  return { success: true };
}

export async function deleteRoadmapTaskAction(taskId: string, analysisId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.roadmapTask.delete({
    where: { id: taskId },
  });

  revalidatePath("/dashboard/roadmap");
  return { success: true };
}
