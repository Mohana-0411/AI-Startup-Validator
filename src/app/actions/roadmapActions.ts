"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

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
    // Dynamically generate unique roadmap tasks based on startup analysis
    let parsedResult;
    try {
      parsedResult = JSON.parse(analysis.analysisResult);
    } catch {
      parsedResult = null;
    }

    const defaultDynamicTasks = [
      // Phase 1: Idea Validation
      {
        phase: "Phase 1: Idea Validation",
        title: `Interview 20 ${analysis.audience} users`,
        description: `Conduct 1-on-1 problem discovery interviews to validate pain points around "${analysis.problem.slice(0, 60)}..."`,
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 1: Idea Validation",
        title: `Validate market demand in ${analysis.country}`,
        description: `Test problem urgency and willingness-to-pay for ${analysis.startupName} in target geography.`,
        priority: "High",
        effort: "1 week",
        impact: "High",
      },
      {
        phase: "Phase 1: Idea Validation",
        title: `Benchmark against competitors (${analysis.competitors || "existing alternatives"})`,
        description: `Identify messaging gaps and pricing weaknesses across legacy tools.`,
        priority: "Medium",
        effort: "3-5 days",
        impact: "Medium",
      },

      // Phase 2: MVP Development
      {
        phase: "Phase 2: MVP Development",
        title: `Build core MVP solution: ${analysis.solution.slice(0, 50)}...`,
        description: `Develop lightweight functional prototype addressing the primary customer pain point.`,
        priority: "High",
        effort: "3-4 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2: MVP Development",
        title: `Launch waitlist landing page for ${analysis.startupName}`,
        description: `Set up high-converting landing page highlighting unique value proposition and collecting beta emails.`,
        priority: "High",
        effort: "3 days",
        impact: "High",
      },
      {
        phase: "Phase 2: MVP Development",
        title: `Onboard initial 10 beta test users`,
        description: `Gather direct UX feedback and measure time-to-value activation metrics.`,
        priority: "Medium",
        effort: "1-2 weeks",
        impact: "Medium",
      },

      // Phase 3: Growth
      {
        phase: "Phase 3: Growth",
        title: `Implement ${analysis.businessModel} pricing tiers`,
        description: `Test willingness-to-pay with early adopter cohort and optimize conversion rates.`,
        priority: "High",
        effort: "1 week",
        impact: "High",
      },
      {
        phase: "Phase 3: Growth",
        title: `Optimize customer onboarding & activation rate`,
        description: `Reduce time-to-first-value to under 60 seconds and eliminate setup churn bottlenecks.`,
        priority: "Medium",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3: Growth",
        title: `Launch organic content & LinkedIn outbound campaign`,
        description: `Drive targeted B2B traffic specifically for ${analysis.audience}.`,
        priority: "Medium",
        effort: "Ongoing",
        impact: "Medium",
      },

      // Phase 4: Scale
      {
        phase: "Phase 4: Scale",
        title: `Optimize unit economics (CAC & LTV)`,
        description: `Refine customer acquisition channels to achieve strong positive payback periods.`,
        priority: "High",
        effort: "2-3 weeks",
        impact: "High",
      },
      {
        phase: "Phase 4: Scale",
        title: `Prepare 10-slide YC investor pitch deck`,
        description: `Compile overall score (${analysis.overallScore}/100), traction metrics, and 3-year growth model for VC fundraising.`,
        priority: "Medium",
        effort: "1 week",
        impact: "High",
      },
      {
        phase: "Phase 4: Scale",
        title: `Expand enterprise features & team hiring`,
        description: `Hire core engineering & sales roles and scale platform infrastructure.`,
        priority: "Low",
        effort: "1-2 months",
        impact: "High",
      },
    ];

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
