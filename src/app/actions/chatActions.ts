"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateMentorChatResponse } from "@/lib/openai";

export async function getChatHistoryAction(analysisId?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { messages: [], activeAnalysis: null };
  }

  let targetAnalysis;

  if (analysisId) {
    targetAnalysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId: user.id },
    });
  } else {
    targetAnalysis = await prisma.analysis.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!targetAnalysis) {
    return { messages: [], activeAnalysis: null };
  }

  const messages = await prisma.chatMessage.findMany({
    where: { analysisId: targetAnalysis.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  return {
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
    activeAnalysis: {
      id: targetAnalysis.id,
      startupName: targetAnalysis.startupName,
      overallScore: targetAnalysis.overallScore,
    },
  };
}

export async function sendChatMessageAction(userMessage: string, analysisId?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized. Please log in first." };
  }

  const trimmedMessage = userMessage.trim();
  if (!trimmedMessage) {
    return { error: "Message cannot be empty." };
  }

  let targetAnalysis;

  if (analysisId) {
    targetAnalysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId: user.id },
    });
  } else {
    targetAnalysis = await prisma.analysis.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!targetAnalysis) {
    return {
      error: "No startup analysis found. Please run a startup analysis first so the AI Mentor has your concept context!",
    };
  }

  // Fetch existing chat history for context
  const existingMessages = await prisma.chatMessage.findMany({
    where: { analysisId: targetAnalysis.id },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  // 1. Save user message to database
  await prisma.chatMessage.create({
    data: {
      analysisId: targetAnalysis.id,
      role: "user",
      content: trimmedMessage,
    },
  });

  // 2. Generate Mentor Response with context
  const historyForAI = existingMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const mentorReply = await generateMentorChatResponse({
    userMessage: trimmedMessage,
    history: historyForAI,
    analysisContext: {
      startupName: targetAnalysis.startupName,
      idea: targetAnalysis.idea,
      problem: targetAnalysis.problem,
      solution: targetAnalysis.solution,
      audience: targetAnalysis.audience,
      businessModel: targetAnalysis.businessModel,
      competitors: targetAnalysis.competitors,
      overallScore: targetAnalysis.overallScore,
    },
  });

  // 3. Save assistant reply to database
  await prisma.chatMessage.create({
    data: {
      analysisId: targetAnalysis.id,
      role: "assistant",
      content: mentorReply,
    },
  });

  revalidatePath("/dashboard/chat");
  revalidatePath("/dashboard");
  if (analysisId) {
    revalidatePath(`/dashboard/analysis/${analysisId}`);
  }

  // Return full updated history
  const updatedMessages = await prisma.chatMessage.findMany({
    where: { analysisId: targetAnalysis.id },
    orderBy: { createdAt: "asc" },
  });

  return {
    success: true,
    messages: updatedMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
    activeAnalysis: {
      id: targetAnalysis.id,
      startupName: targetAnalysis.startupName,
      overallScore: targetAnalysis.overallScore,
    },
  };
}

export async function clearChatHistoryAction(analysisId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  await prisma.chatMessage.deleteMany({
    where: { analysisId },
  });

  revalidatePath("/dashboard/chat");
  return { success: true };
}

export async function renameStartupChatTitleAction(analysisId: string, newTitle: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const trimmed = newTitle.trim();
  if (!trimmed) return { error: "Title cannot be empty" };

  await prisma.analysis.update({
    where: { id: analysisId, userId: user.id },
    data: { startupName: trimmed },
  });

  revalidatePath("/dashboard/chat");
  return { success: true };
}

export async function regenerateLastMentorResponseAction(analysisId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const targetAnalysis = await prisma.analysis.findFirst({
    where: { id: analysisId, userId: user.id },
  });

  if (!targetAnalysis) return { error: "Analysis not found" };

  const allMessages = await prisma.chatMessage.findMany({
    where: { analysisId: targetAnalysis.id },
    orderBy: { createdAt: "asc" },
  });

  if (allMessages.length === 0) return { error: "No messages to regenerate" };

  // If the last message is assistant, delete it
  const lastMsg = allMessages[allMessages.length - 1];
  if (lastMsg.role === "assistant") {
    await prisma.chatMessage.delete({ where: { id: lastMsg.id } });
  }

  // Find the last user message
  const remainingMessages = await prisma.chatMessage.findMany({
    where: { analysisId: targetAnalysis.id },
    orderBy: { createdAt: "asc" },
  });

  const lastUserMsg = remainingMessages.filter((m) => m.role === "user").slice(-1)[0];
  if (!lastUserMsg) return { error: "No user message found to regenerate response for" };

  const historyForAI = remainingMessages
    .filter((m) => m.id !== lastUserMsg.id)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const mentorReply = await generateMentorChatResponse({
    userMessage: lastUserMsg.content,
    history: historyForAI,
    analysisContext: {
      startupName: targetAnalysis.startupName,
      idea: targetAnalysis.idea,
      problem: targetAnalysis.problem,
      solution: targetAnalysis.solution,
      audience: targetAnalysis.audience,
      businessModel: targetAnalysis.businessModel,
      competitors: targetAnalysis.competitors,
      overallScore: targetAnalysis.overallScore,
    },
  });

  await prisma.chatMessage.create({
    data: {
      analysisId: targetAnalysis.id,
      role: "assistant",
      content: mentorReply,
    },
  });

  const finalMessages = await prisma.chatMessage.findMany({
    where: { analysisId: targetAnalysis.id },
    orderBy: { createdAt: "asc" },
  });

  revalidatePath("/dashboard/chat");
  return {
    success: true,
    messages: finalMessages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  };
}
