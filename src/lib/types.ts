export interface AnalysisResultJSON {
  overallScore: number;
  marketPotential: {
    score: number;
    summary: string;
    details: string;
  };
  problemValidation: {
    score: number;
    summary: string;
    details: string;
  };
  solutionQuality: {
    score: number;
    summary: string;
    details: string;
  };
  competitionLevel: {
    score: number;
    level: "Low" | "Medium" | "High";
    summary: string;
    details: string;
  };
  businessModel: {
    score: number;
    summary: string;
    details: string;
  };
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  risks: string[];
  nextSteps: string[];
  investorVerdict?: string;
}

export interface AnalysisRecord {
  id: string;
  userId: string;
  startupName: string;
  idea: string;
  problem: string;
  solution: string;
  audience: string;
  country: string;
  businessModel: string;
  competitors?: string | null;
  analysisResult: string; // JSON string
  overallScore: number;
  createdAt: Date | string;
}

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
}
