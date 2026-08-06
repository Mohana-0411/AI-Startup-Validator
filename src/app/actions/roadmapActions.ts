"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { detectStartupCategory } from "@/lib/openai";

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

    const fullText = `${analysis.startupName} ${analysis.idea} ${analysis.businessModel} ${analysis.problem} ${analysis.solution}`;
    const category = parsedResult?.businessClassification?.industry
      ? (parsedResult.businessClassification.industry.toUpperCase().includes("FOOD") ? "FOOD" : detectStartupCategory(fullText))
      : detectStartupCategory(fullText);

    const lifecycleStage = parsedResult?.startupLifecycle?.currentStage || "Validation Stage";

    let defaultDynamicTasks: {
      phase: string;
      title: string;
      description: string;
      priority: string;
      effort: string;
      impact: string;
    }[] = [];

    if (lifecycleStage === "Idea Stage") {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Market Research",
          title: `Analyze TAM/SAM market size for ${analysis.startupName}`,
          description: `Estimate total addressable market and existing spending habits in ${analysis.country}.`,
          priority: "High",
          effort: "3-5 days",
          impact: "High",
        },
        {
          phase: "Phase 2: Customer Interviews",
          title: `Interview 15 target ${analysis.audience} users`,
          description: `Conduct structured 1-on-1 calls to validate problem severity around "${analysis.problem.slice(0, 50)}...".`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 3: Problem Validation",
          title: `Benchmark against existing alternatives (${analysis.competitors || "legacy options"})`,
          description: `Identify key gaps in current solutions and specify unique value proposition.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
      ];
    } else if (lifecycleStage === "Validation Stage") {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Prototype",
          title: `Design lightweight prototype counter/wireframe for ${analysis.startupName}`,
          description: `Create non-code visual mockups illustrating the core solution workflow.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
        {
          phase: "Phase 2: Landing Page",
          title: `Launch waitlist landing page for ${analysis.startupName}`,
          description: `Set up high-converting landing page highlighting USP and capturing early emails.`,
          priority: "High",
          effort: "3-5 days",
          impact: "High",
        },
        {
          phase: "Phase 3: Feedback Collection",
          title: `Collect feedback from 20 prospective customer leads`,
          description: `Measure landing page signup conversion rate and willingness-to-pay intent.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
      ];
    } else if (lifecycleStage === "MVP Stage") {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Develop Product",
          title: `Construct core functional MVP addressing "${analysis.problem.slice(0, 50)}..."`,
          description: `Build baseline working version focused strictly on primary customer value.`,
          priority: "High",
          effort: "2-4 weeks",
          impact: "High",
        },
        {
          phase: "Phase 2: Beta Testing",
          title: `Onboard first 10 beta test users for ${analysis.startupName}`,
          description: `Grant early access to cohort and track daily active usage and bug reports.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 3: Feature Refinement",
          title: `Optimize usability bottlenecks based on user feedback`,
          description: `Iterate on MVP features to achieve 80%+ task completion rate without support.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
      ];
    } else if (category === "FOOD") {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Location & Licensing",
          title: `Analyze high-footfall locations in ${analysis.country}`,
          description: `Identify target spots near commercial markets or college clusters for ${analysis.startupName}.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 1: Location & Licensing",
          title: `Apply for Food License (FSSAI/Municipal Permits) & GST`,
          description: `Secure necessary food safety authority permissions and local municipal permits.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 2: Soft Launch & Marketing",
          title: `Conduct 3-day Soft Launch with introductory pricing`,
          description: `Offer deals to attract neighborhood footfall and gather initial customer feedback.`,
          priority: "High",
          effort: "3 days",
          impact: "High",
        },
      ];
    } else {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Customer Discovery",
          title: `Interview 20 ${analysis.audience} users`,
          description: `Conduct problem discovery interviews to validate pain points around "${analysis.problem.slice(0, 60)}...".`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 2: MVP Prototype",
          title: `Build functional MVP solution for ${analysis.startupName}`,
          description: `Develop lightweight functional prototype addressing primary customer pain point.`,
          priority: "High",
          effort: "3-4 weeks",
          impact: "High",
        },
        {
          phase: "Phase 3: Growth & Scaling",
          title: `Scale customer acquisition & optimize CAC`,
          description: `Expand marketing channels and refine conversion rates for ${analysis.businessModel}.`,
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
