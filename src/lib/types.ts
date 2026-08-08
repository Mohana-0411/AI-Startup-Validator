export type LifecycleStage =
  | "Idea Stage"
  | "Validation Stage"
  | "MVP Stage"
  | "Launch Stage"
  | "Early Revenue Stage"
  | "Growth Stage"
  | "Scale Stage"
  | string;

export type IdeaTypeKind =
  | "Technology Startup"
  | "Traditional Business"
  | "Local Business"
  | "Service Business"
  | "Product Business";

export interface IndustryProfile {
  detectedIndustry: string;
  subIndustry: string;
  businessCategoryKind: string;
  revenueModelType: string;
  regulatoryBody: string;
  keyOperatingMetrics: string[];
}

export interface OperatingMetricGauge {
  title: string;
  category: string;
  description: string;
  score?: number;
  recommendation?: string;
}

export interface VentureContext {
  ventureName: string;
  description: string;
  domainCategory: string;
  subDomain: string;
  ventureType: string;
  operatingCategory: "Physical Offline" | "Digital / Online" | "Hybrid" | "D2C / E-Commerce" | "B2B Industrial / Wholesale";
  revenueModel: string;
  customerSegment: string;
  marketScope: string;
  problem: string;
  solution: string;
  competitors?: string | null;
  isTechnologyProduct: boolean;
  keyOperatingMetrics: OperatingMetricGauge[];
  primaryRisks: string[];
  primarySuccessFactors: string[];
  regulatoryRequirements: string[];
  competitorTypes: { name: string; category: string; description: string; strengths: string[]; weaknesses: string[]; pricingModel: string; differentiation: string; marketPosition: string }[];
  suggestedRoadmapPhases: { phase: string; title: string; description: string; priority: string; effort: string; impact: string }[];
  stageTimeline: string[];
  currentStageName: string;
}

export interface StartupLifecycle {
  currentStage: string;
  confidenceScore: number;
  reason: string;
  nextMilestone: string;
  estimatedTimeToNextStage: string;
  keyObjectives: string[];
  currentStageRisks: string[];
  successProbability: number;
  potentialBlockers: string[];
  suggestedPriorities: string[];
  stageTimeline?: string[];
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
  ventureContext?: VentureContext;
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
