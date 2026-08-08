"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildVentureContext } from "@/lib/openai";

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

    const roadmapPhases = vContext.suggestedRoadmapPhases || [];

    const defaultDynamicTasks = roadmapPhases.map((phaseItem: any) => ({
      phase: phaseItem.phase || "Phase 1: Validation",
      title: phaseItem.title,
      description: phaseItem.description || `Execute ${phaseItem.title} for ${analysis.startupName} in ${analysis.country}.`,
      priority: phaseItem.priority || "High",
      effort: phaseItem.effort || "1-2 weeks",
      impact: phaseItem.impact || "High",
    }));

    // Save to database
    await prisma.roadmapTask.createMany({
      data: defaultDynamicTasks.map((t: any) => ({
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
