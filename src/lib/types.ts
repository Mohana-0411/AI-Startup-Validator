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

export interface DynamicSuccessDriver {
  name: string;
  description: string;
  whyItMatters: string;
  relevantCategory: string;
  estimatedScore: number;
  reasoning: string;
  improvementAction: string;
}

export interface DynamicCompetitorAlternative {
  name: string;
  alternativeType: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  differentiationStrategy: string;
}

export interface DynamicExecutionMilestone {
  phase: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  effort: string;
  impact: "High" | "Medium" | "Low";
}

export interface VentureModel {
  ventureName: string;
  description: string;
  problem?: string;
  solution?: string;
  offeringType: "Physical Product" | "Service" | "Digital / Software" | "Facility / Outlet" | "Manufacturing / Production" | "Agriculture / Farming" | "Hybrid / Multi-Model";
  valueDeliveryMechanism: string;
  operatingEnvironment: "Physical Offline" | "Digital Online" | "Hybrid Field & Digital" | "Industrial Plant" | "Farm / Agricultural Land";
  revenueMechanism: string;
  customerPersona: string;
  marketScope: string;
  isTechnologyProduct: boolean;
  requiredResources: string[];
  operationalConstraints: string[];
  keySuccessDrivers: DynamicSuccessDriver[];
  competitiveAlternatives: DynamicCompetitorAlternative[];
  executionMilestones: DynamicExecutionMilestone[];
  primaryRisks: string[];
  regulatoryRequirements: string[];
  currentStageName: string;
  stageTimeline: string[];
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

export interface DynamicHealthCategory {
  categoryName: string;
  score: number;
  summary: string;
  details: string;
  recommendation: string;
}

export interface AnalysisResultJSON {
  overallScore: number;
  ventureModel?: VentureModel;
  ventureContext?: VentureModel; // Alias for backward compatibility
  healthScores?: DynamicHealthCategory[];
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
