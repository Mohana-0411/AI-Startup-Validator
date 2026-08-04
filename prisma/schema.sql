-- PostgreSQL Production DDL for Neon Database

-- 1. User Table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- 2. Analysis Table
CREATE TABLE IF NOT EXISTS "Analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startupName" TEXT NOT NULL,
    "idea" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "competitors" TEXT,
    "analysisResult" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- 3. ChatMessage Table
CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- 4. RoadmapTask Table
CREATE TABLE IF NOT EXISTS "RoadmapTask" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "effort" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoadmapTask_pkey" PRIMARY KEY ("id")
);

-- Indexes & Constraints
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Analysis_userId_idx" ON "Analysis"("userId");
CREATE INDEX IF NOT EXISTS "ChatMessage_analysisId_idx" ON "ChatMessage"("analysisId");
CREATE INDEX IF NOT EXISTS "RoadmapTask_analysisId_idx" ON "RoadmapTask"("analysisId");

-- Foreign Keys with Cascade Delete
ALTER TABLE "Analysis" DROP CONSTRAINT IF EXISTS "Analysis_userId_fkey";
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_analysisId_fkey";
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RoadmapTask" DROP CONSTRAINT IF EXISTS "RoadmapTask_analysisId_fkey";
ALTER TABLE "RoadmapTask" ADD CONSTRAINT "RoadmapTask_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
