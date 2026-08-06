export type LifecycleStage =
  | "Idea Stage"
  | "Validation Stage"
  | "MVP Stage"
  | "Launch Stage"
  | "Early Revenue Stage"
  | "Growth Stage"
  | "Scale Stage";

export type IdeaTypeKind =
  | "Technology Startup"
  | "Traditional Business"
  | "Local Business"
  | "Service Business"
  | "Product Business";

export interface IndustryProfile {
  detectedIndustry: string;
  subIndustry: string;
  businessCategoryKind:
    | "Product Business"
    | "Service Business"
    | "Offline Business"
    | "Online Business"
    | "Hybrid Business"
    | "Local Business"
    | "Technology Startup"
    | "Manufacturing"
    | "Franchise"
    | "Marketplace"
    | "E-Commerce"
    | "Social Enterprise";
  revenueModelType: string;
  regulatoryBody: string;
  keyOperatingMetrics: string[];
}

export interface StartupLifecycle {
  currentStage: LifecycleStage;
  confidenceScore: number;
  reason: string;
  nextMilestone: string;
  estimatedTimeToNextStage: string;
  keyObjectives: string[];
  currentStageRisks: string[];
  successProbability: number;
  potentialBlockers: string[];
  suggestedPriorities: string[];
}

export interface BusinessClassification {
  industry: string;
  businessCategory: string;
  ideaTypeKind?: IdeaTypeKind;
  businessType: "Offline Local Business" | "Physical Goods / D2C" | "Digital / Software / SaaS" | "Service / Consulting" | "Hybrid";
  revenueModel: string;
  scalability: "Low" | "Medium" | "High";
  businessStage: "Idea" | "MVP" | "Existing Business";
  primaryCustomerSegment: string;
  marketScope: "Local" | "Regional" | "National" | "Global";
  digitalDependency: "Low" | "Medium" | "High";
}

export interface BusinessDNA {
  startupName: string;
  industry: string;
  subIndustry: string;
  businessCategory: string;
  ideaTypeKind?: IdeaTypeKind;
  businessType: "Offline Local Business" | "Physical Goods / D2C" | "Digital / Software / SaaS" | "Service / Consulting" | "Hybrid";
  businessModel: string;
  revenueModel: string;
  businessStage: "Idea" | "MVP" | "Existing Business";
  targetCustomers: string;
  customerPersona: string;
  marketScope: "Local" | "Regional" | "National" | "Global";
  investmentLevel: "Low" | "Medium" | "High";
  operationalComplexity: "Low" | "Medium" | "High";
  technologyDependency: "Low" | "Medium" | "High";
  scalability: "Low" | "Medium" | "High";
  expansionPotential: string;
  fundingRequirement: string;
  fundingType: string;
  competitionLevel: "Low" | "Medium" | "High";
  riskLevel: "Low" | "Medium" | "High";
  growthPotential: "Medium" | "High" | "Exponential";
  digitalPresenceImportance: "Low" | "Medium" | "High";
  requiredLicenses: string[];
  primarySuccessFactors: string[];
  biggestChallenges: string[];
  keyAdvantages: string[];
  uniqueSellingProposition: string;
  estimatedTimeToLaunch: string;
  estimatedInitialInvestment: string;
  recommendedTeamSize: string;
  businessPriority: string;
}

export interface AnalysisResultJSON {
  overallScore: number;
  industryProfile?: IndustryProfile;
  businessClassification?: BusinessClassification;
  businessDNA?: BusinessDNA;
  startupLifecycle?: StartupLifecycle;
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
  createdAt?: Date | string;
}
