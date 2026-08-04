"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, getOrCreateDemoUser } from "@/lib/auth";
import { startupAnalysisSchema } from "@/lib/validators";
import { generateStartupAnalysis } from "@/lib/openai";

export async function createAnalysisAction(prevState: any, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized. Please log in first." };
  }

  const input = {
    startupName: formData.get("startupName") as string,
    idea: formData.get("idea") as string,
    problem: formData.get("problem") as string,
    solution: formData.get("solution") as string,
    audience: formData.get("audience") as string,
    country: formData.get("country") as string,
    businessModel: formData.get("businessModel") as string,
    competitors: (formData.get("competitors") as string) || "",
  };

  const validation = startupAnalysisSchema.safeParse(input);
  if (!validation.success) {
    return {
      error: validation.error.errors[0]?.message || "Validation failed for input fields.",
    };
  }

  let createdAnalysisId: string;

  try {
    // 1. Generate structured analysis using OpenAI / AI Investor engine
    const resultJSON = await generateStartupAnalysis(input);

    // 2. Save analysis record to Prisma database
    const newRecord = await prisma.analysis.create({
      data: {
        userId: user.id,
        startupName: input.startupName,
        idea: input.idea,
        problem: input.problem,
        solution: input.solution,
        audience: input.audience,
        country: input.country,
        businessModel: input.businessModel,
        competitors: input.competitors,
        analysisResult: JSON.stringify(resultJSON),
        overallScore: resultJSON.overallScore,
      },
    });

    createdAnalysisId = newRecord.id;
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/history");
  } catch (error: any) {
    console.error("Create Analysis Error:", error);
    return {
      error: "An unexpected error occurred while analyzing your startup idea. Please try again.",
    };
  }

  // 3. Redirect user to Results page
  redirect(`/dashboard/analysis/${createdAnalysisId}`);
}

export async function deleteAnalysisAction(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.analysis.deleteMany({
      where: {
        id: id,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/history");
    return { success: true };
  } catch (error) {
    console.error("Delete Analysis Error:", error);
    return { error: "Failed to delete analysis" };
  }
}
