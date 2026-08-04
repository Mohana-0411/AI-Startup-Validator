import { z } from "zod";

export const startupAnalysisSchema = z.object({
  startupName: z
    .string()
    .min(2, "Startup name must be at least 2 characters")
    .max(100, "Startup name is too long"),
  idea: z
    .string()
    .min(10, "One-line idea must be at least 10 characters")
    .max(250, "One-line idea must be under 250 characters"),
  problem: z
    .string()
    .min(20, "Problem description must be at least 20 characters"),
  solution: z
    .string()
    .min(20, "Solution description must be at least 20 characters"),
  audience: z
    .string()
    .min(5, "Target audience must be at least 5 characters"),
  country: z
    .string()
    .min(2, "Country/Region must be specified"),
  businessModel: z
    .string()
    .min(5, "Business model must be specified"),
  competitors: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type StartupAnalysisInput = z.infer<typeof startupAnalysisSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
