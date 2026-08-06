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

    let defaultDynamicTasks: {
      phase: string;
      title: string;
      description: string;
      priority: string;
      effort: string;
      impact: string;
    }[] = [];

    if (category === "FOOD") {
      defaultDynamicTasks = [
        // Phase 1: Location & Licensing
        {
          phase: "Phase 1: Location & Licensing",
          title: `Analyze high-footfall locations in ${analysis.country}`,
          description: `Identify target spots near commercial markets, transit hubs, or college clusters for ${analysis.startupName}.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 1: Location & Licensing",
          title: `Apply for Food License (FSSAI/Municipal Permits) & GST`,
          description: `Secure necessary food safety authority permissions and local municipal operating permits.`,
          priority: "High",
          effort: "1-2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 1: Location & Licensing",
          title: `Set up unit economics & daily operating cost budget`,
          description: `Calculate raw material costs, rent, staff wages, and target 65%+ gross profit margins.`,
          priority: "High",
          effort: "3-5 days",
          impact: "High",
        },
        // Phase 2: Recipe & Supplier Setup
        {
          phase: "Phase 2: Recipe & Supplier Setup",
          title: `Establish wholesale ingredient supply contracts`,
          description: `Partner with local wholesale suppliers for fresh daily ingredients and packaging supplies.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
        {
          phase: "Phase 2: Recipe & Supplier Setup",
          title: `Standardize recipes & taste consistency protocols`,
          description: `Test and lock in exact recipe measurements to guarantee identical taste across daily shifts.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
        {
          phase: "Phase 2: Recipe & Supplier Setup",
          title: `Finalize counter design, branding & hygiene setup`,
          description: `Set up clean, branded counter layout with stainless steel equipment and disposable gloves/aprons.`,
          priority: "Medium",
          effort: "1-2 weeks",
          impact: "Medium",
        },
        // Phase 3: Soft Launch & Local Marketing
        {
          phase: "Phase 3: Soft Launch & Marketing",
          title: `Conduct 3-day Soft Launch with introductory pricing`,
          description: `Offer inauguration deals to attract neighborhood footfall and gather initial customer feedback.`,
          priority: "High",
          effort: "3 days",
          impact: "High",
        },
        {
          phase: "Phase 3: Soft Launch & Marketing",
          title: `Register on local food delivery apps (Zomato / Swiggy)`,
          description: `Create merchant profiles on delivery platforms and optimize food menu photography.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
        {
          phase: "Phase 3: Soft Launch & Marketing",
          title: `Launch local Instagram & Google Maps business listing`,
          description: `Optimize local search keywords and collect positive customer reviews to drive weekend footfall.`,
          priority: "Medium",
          effort: "1 week",
          impact: "Medium",
        },
        // Phase 4: Expansion & Franchising
        {
          phase: "Phase 4: Expansion & Franchising",
          title: `Establish customer loyalty repeat reward program`,
          description: `Drive repeat visits by offering phone-number based stamp cards or discount perks.`,
          priority: "Medium",
          effort: "2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 4: Expansion & Franchising",
          title: `Standardize SOP manual for multi-outlet expansion`,
          description: `Document kitchen operations, hiring, and daily inventory audit procedures for new branches.`,
          priority: "Low",
          effort: "1 month",
          impact: "High",
        },
      ];
    } else if (category === "FASHION") {
      defaultDynamicTasks = [
        {
          phase: "Phase 1: Brand & Sourcing",
          title: `Define brand positioning & target demographic`,
          description: `Establish brand identity, aesthetics, and pricing tiers for ${analysis.startupName}.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
        {
          phase: "Phase 1: Brand & Sourcing",
          title: `Source fabric suppliers & garment manufacturers`,
          description: `Audit textile quality, minimum order quantities (MOQs), and per-piece manufacturing cost.`,
          priority: "High",
          effort: "2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 2: Samples & D2C Store",
          title: `Order sample batch & conduct fit/stitch testing`,
          description: `Inspect fabric durability, wash behavior, and size fit across target sizes.`,
          priority: "High",
          effort: "2 weeks",
          impact: "High",
        },
        {
          phase: "Phase 2: Samples & D2C Store",
          title: `Launch Shopify / E-Commerce Storefront`,
          description: `Set up mobile-optimized online storefront with high-resolution lifestyle photography.`,
          priority: "High",
          effort: "1 week",
          impact: "High",
        },
        {
          phase: "Phase 3: Marketing & Drops",
          title: `Launch Instagram Reels & Influencer Seeding campaign`,
          description: `Send sample gift boxes to micro-influencers and launch viral short-form video content.`,
          priority: "High",
          effort: "2-3 weeks",
          impact: "High",
        },
        {
          phase: "Phase 4: Scaling",
          title: `Optimize inventory drops & wholesale distribution`,
          description: `Scale batch production and explore retail store partnerships.`,
          priority: "Medium",
          effort: "1-2 months",
          impact: "High",
        },
      ];
    } else {
      defaultDynamicTasks = [
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
          title: `Prepare 10-slide investor pitch deck`,
          description: `Compile overall score (${analysis.overallScore}/100), traction metrics, and 3-year growth model.`,
          priority: "Medium",
          effort: "1 week",
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
