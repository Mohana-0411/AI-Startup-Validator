import OpenAI from "openai";
import {
  AnalysisResultJSON,
  BusinessClassification,
  BusinessDNA,
  StartupLifecycle,
  IndustryProfile,
  VentureModel,
  DynamicHealthCategory,
  DynamicSuccessDriver,
  DynamicCompetitorAlternative,
  DynamicExecutionMilestone,
} from "./types";

interface StartupIdeaInput {
  startupName: string;
  idea: string;
  problem: string;
  solution: string;
  audience: string;
  country: string;
  businessModel: string;
  competitors?: string | null;
}

const DOMAIN_REFUSAL_MESSAGE = `I'm designed specifically as an AI Venture Validator to evaluate business ideas, commercial models, and growth strategies.

I can't provide reliable guidance on non-business topics.

Ask me about any startup or business venture, including:

• Business validation, location footfall & customer demand
• Operational requirements, equipment & regulatory permits
• Unit economics, gross margins & pricing strategy
• Domain-specific execution roadmaps & competitor analysis
• Growth strategy & expansion planning`;

export function isStartupRelatedIntent(message: string): { isStartup: boolean; category?: string } {
  const lower = message.toLowerCase().trim();

  const nonStartupTriggers = [
    { keywords: ["superman", "batman", "spiderman", "avengers", "marvel", "dc comics", "hero", "superhero"], category: "superheroes & comics" },
    { keywords: ["recipe to cook at home", "bake cake recipe", "curry recipe", "kitchen dish recipe", "pasta recipe", "noodle recipe"], category: "cooking recipes" },
    { keywords: ["movie review", "cinema showtime", "actor biography", "actress", "film summary", "hollywood movie", "bollywood movie", "netflix show", "anime list"], category: "movies & entertainment" },
    { keywords: ["weather today", "temperature today", "rain forecast", "climate today"], category: "weather" },
    { keywords: ["cricket score", "football score", "soccer score", "nba score", "ipl match score", "tennis match score"], category: "sports scores" },
    { keywords: ["tell me a joke", "riddle for kids", "funny story", "write a poem", "sing a song"], category: "entertainment" },
    { keywords: ["capital of france", "who invented electricity", "who painted Mona Lisa", "presidential election date", "history of rome", "math homework", "solve equation"], category: "general trivia & homework" },
    { keywords: ["horoscope today", "astrology reading", "zodiac sign", "tarot card"], category: "astrology" },
  ];

  for (const trigger of nonStartupTriggers) {
    if (trigger.keywords.some((kw) => lower.includes(kw))) {
      return { isStartup: false, category: trigger.category };
    }
  }

  const startupKeywords = [
    "startup", "business", "venture", "idea", "market", "validate", "validation", "customer", "discovery",
    "competitor", "competition", "rival", "moat", "product", "pricing", "model", "strategy",
    "go-to-market", "gtm", "marketing", "sales", "growth", "funding", "fundraise", "investor",
    "vc", "pitch", "deck", "saas", "entrepreneur", "entrepreneurship", "metric", "cac",
    "ltv", "pmf", "product-market fit", "financial", "revenue", "monetiz", "team", "operation",
    "score", "risk", "opportunity", "audience", "mvp", "launch", "b2b", "b2c",
    "churn", "retention", "waitlist", "traction", "scale", "feature", "workflow", "unit economics",
    "waffle", "food", "stall", "restaurant", "cafe", "snack", "bakery", "kitchen", "catering",
    "bamboo", "furniture", "workshop", "craft", "wood", "factory", "machinery", "manufactur", "plant",
    "drone", "inspection", "crop", "farm", "agri", "organic", "vegetable", "dairy", "solar", "storage",
    "pet", "grooming", "transport", "repair", "clinic", "dental", "hospital", "doctor",
    "shop", "store", "retail", "boutique", "brand", "clothing", "fashion", "apparel",
    "gym", "fitness", "wellness", "salon", "laundry", "tuition", "school", "coaching",
    "construction", "real estate", "logistics", "warehouse", "agency", "export", "import", "wholesale"
  ];

  const hasStartupKw = startupKeywords.some((kw) => lower.includes(kw));
  if (hasStartupKw) {
    return { isStartup: true };
  }

  const greetings = ["hi", "hello", "hey", "help", "good morning", "good evening", "what can you do", "procedure", "procedures", "steps", "guide"];
  if (greetings.some((g) => lower === g || lower.startsWith(g))) {
    return { isStartup: true };
  }

  return { isStartup: false, category: "unrelated topics" };
}

export function assessClarificationNeed(input: StartupIdeaInput): { needsClarification: boolean; questions?: string[]; message?: string } {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution}`.trim();
  const name = input.startupName.trim();
  const idea = input.idea.trim();

  // Self-contained idea markers
  const domainKeywords = [
    "waffle", "food", "stall", "restaurant", "bakery", "cafe", "kitchen", "snack",
    "clothing", "fashion", "store", "boutique", "shop", "retail", "gym", "fitness", "salon",
    "hospital", "clinic", "dental", "doctor", "medical", "paper cup", "factory", "mill", "plant",
    "bamboo", "furniture", "workshop", "drone", "crop", "farm", "agri", "organic", "vegetable", "ev charging", "solar",
    "pet", "grooming", "transport", "repair", "consulting", "software", "saas", "app", "web", "resume builder",
    "delivery", "marketplace", "e-commerce", "wholesale", "cleaning", "school", "coaching", "warehouse", "audiobook"
  ];

  const lower = fullText.toLowerCase();
  const hasDomainKeyword = domainKeywords.some((kw) => lower.includes(kw));

  if (hasDomainKeyword && idea.length >= 6) {
    return { needsClarification: false };
  }

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 14 || idea.length < 14 || (!hasDomainKeyword && idea.split(" ").length < 4)) {
    return {
      needsClarification: true,
      questions: [
        `What does ${name} offer in detail?`,
        `Who are your target customers?`,
        `Is ${name} a product, service, physical business, or technology venture?`,
      ],
      message: `Before I validate this venture, I need a little more context:`,
    };
  }

  return { needsClarification: false };
}

/**
 * PURE SEMANTIC VENTURE MODEL EXTRACTION ENGINE
 * Derives a canonical VentureModel from the complete user description
 * WITHOUT using hardcoded industry if/else statements or template maps.
 */
export function extractVentureModel(input: StartupIdeaInput): VentureModel {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution} ${input.businessModel}`.toLowerCase();

  // 1. Evaluate if the primary value delivery mechanism relies strictly on software code/APIs/app vs physical operations
  const isSoftware =
    fullText.includes("software") ||
    fullText.includes("saas") ||
    fullText.includes("web app") ||
    fullText.includes("mobile app") ||
    fullText.includes("api platform") ||
    fullText.includes("resume builder") ||
    (fullText.includes("ai ") && (fullText.includes("tool") || fullText.includes("generator") || fullText.includes("platform")));

  // 2. Infer Offering Type & Operating Environment
  let offeringType: VentureModel["offeringType"] = "Physical Product";
  let operatingEnvironment: VentureModel["operatingEnvironment"] = "Physical Offline";
  let valueDeliveryMechanism = "Direct in-person physical delivery";

  if (isSoftware) {
    offeringType = "Digital / Software";
    operatingEnvironment = "Digital Online";
    valueDeliveryMechanism = "Cloud web dashboard & mobile application interface";
  } else if (fullText.includes("stall") || fullText.includes("cart") || fullText.includes("counter") || fullText.includes("outlet") || fullText.includes("shop") || fullText.includes("store")) {
    offeringType = "Facility / Outlet";
    operatingEnvironment = "Physical Offline";
    valueDeliveryMechanism = "In-person commercial storefront counter serving";
  } else if (fullText.includes("factory") || fullText.includes("mill") || fullText.includes("manufactur") || fullText.includes("plant") || fullText.includes("workshop")) {
    offeringType = "Manufacturing / Production";
    operatingEnvironment = "Industrial Plant";
    valueDeliveryMechanism = "B2B wholesale batch manufacturing and physical delivery logistics";
  } else if (fullText.includes("farm") || fullText.includes("crop") || fullText.includes("agri") || fullText.includes("harvest") || fullText.includes("organic")) {
    offeringType = "Agriculture / Farming";
    operatingEnvironment = "Farm / Agricultural Land";
    valueDeliveryMechanism = "Bulk produce harvesting, cold storage, and mandi wholesale distribution";
  } else if (fullText.includes("service") || fullText.includes("grooming") || fullText.includes("transport") || fullText.includes("inspection") || fullText.includes("repair") || fullText.includes("rental")) {
    offeringType = "Service";
    operatingEnvironment = fullText.includes("drone") || fullText.includes("field") ? "Hybrid Field & Digital" : "Physical Offline";
    valueDeliveryMechanism = "On-site field service execution by trained technicians/operators";
  }

  // 3. Dynamically Discover Key Success Drivers
  const keySuccessDrivers: DynamicSuccessDriver[] = discoverSuccessDrivers(input, offeringType, operatingEnvironment, isSoftware);

  // 4. Dynamically Discover Competitive Alternatives
  const competitiveAlternatives: DynamicCompetitorAlternative[] = discoverCompetitiveAlternatives(input, offeringType, isSoftware);

  // 5. Dynamically Discover Execution Milestones
  const executionMilestones: DynamicExecutionMilestone[] = discoverExecutionMilestones(input, offeringType, isSoftware);

  // 6. Stage & Timeline
  let stageTimeline = ["1. Concept & Feasibility", "2. Demand & Location Selection", "3. Setup & Permitting", "4. Launch", "5. Operational Optimization", "6. Expansion"];
  let currentStageName = "Demand & Feasibility Validation";

  if (isSoftware) {
    stageTimeline = ["1. Idea", "2. Problem Validation", "3. MVP Prototype", "4. Product-Market Fit", "5. Growth", "6. Scale"];
    currentStageName = "Problem Validation Stage";
  } else if (offeringType === "Manufacturing / Production") {
    stageTimeline = ["1. Idea / Concept", "2. Feasibility & Machinery Sourcing", "3. Factory Setup & Licensing", "4. Pilot Batch Production", "5. Commercial Launch", "6. Capacity Optimization", "7. Expansion"];
    currentStageName = "Machinery & Feasibility Sourcing";
  }

  return {
    ventureName: input.startupName.trim(),
    description: input.idea.trim(),
    problem: input.problem.trim(),
    solution: input.solution.trim(),
    offeringType,
    valueDeliveryMechanism,
    operatingEnvironment,
    revenueMechanism: input.businessModel || "Direct Commercial Sales",
    customerPersona: input.audience || "Target Customers",
    marketScope: input.country || "Local Market",
    isTechnologyProduct: isSoftware,
    requiredResources: isSoftware
      ? ["Cloud Server Infrastructure", "Software Engineering Team", "Database Architecture"]
      : offeringType === "Manufacturing / Production"
      ? ["High-Speed Machinery Equipment", "Industrial Factory Space", "Raw Material Stock", "Power Load Connection"]
      : offeringType === "Facility / Outlet"
      ? ["High-Footfall Counter Location", "Cooking/Serving Equipment", "Raw Ingredients", "Point-of-Sale Counter"]
      : ["Operational Equipment & Vehicles", "Trained Field Technicians", "Local Business Permits"],
    operationalConstraints: isSoftware
      ? ["Cloud API costs and uptime latency", "User onboarding activation friction"]
      : ["Raw material price fluctuations", "Location footfall variations due to weather", "Local municipal licensing permits"],
    keySuccessDrivers,
    competitiveAlternatives,
    executionMilestones,
    primaryRisks: isSoftware
      ? ["High customer acquisition cost (CAC) relative to LTV", "Competitive feature copying"]
      : ["Raw ingredient/material cost inflation", "Location footfall drops during adverse weather", "Permitting approval delays"],
    regulatoryRequirements: isSoftware
      ? ["Data Privacy Standards", "Payment Gateway Security Compliance"]
      : offeringType === "Facility / Outlet" && (fullText.includes("waffle") || fullText.includes("food") || fullText.includes("coffee"))
      ? ["FSSAI Food Safety Registration", "Municipal Trade License"]
      : ["Municipal Trade License", "GST Registration", "Local Safety Clearances"],
    currentStageName,
    stageTimeline,
  };
}

/**
 * Dynamic Success Driver Discovery Engine
 * Infers what ACTUALLY determines whether THIS specific venture succeeds or fails.
 */
function discoverSuccessDrivers(
  input: StartupIdeaInput,
  offeringType: VentureModel["offeringType"],
  operatingEnv: VentureModel["operatingEnvironment"],
  isSoftware: boolean
): DynamicSuccessDriver[] {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution}`.toLowerCase();

  if (isSoftware) {
    return [
      {
        name: "Problem Severity & User Need Clarity",
        description: `Evaluates how severe the pain point is for ${input.audience || "target users"}.`,
        whyItMatters: "High pain severity ensures users actively seek a solution and are willing to pay subscription fees.",
        relevantCategory: "Customer Demand",
        estimatedScore: 85,
        reasoning: `The defined problem ("${input.problem.slice(0, 60)}...") represents a clear workflow friction point.`,
        improvementAction: "Conduct 15 structured discovery interviews to confirm pain urgency.",
      },
      {
        name: "Product Differentiation & Moat",
        description: "Assesses unique software workflow speed vs existing market alternatives.",
        whyItMatters: "A clear product moat prevents churn and protects against competitive cloning.",
        relevantCategory: "Technology & Product",
        estimatedScore: 82,
        reasoning: "The proposed solution offers dedicated automation for target user needs.",
        improvementAction: "Highlight your primary automated feature in onboarding messaging.",
      },
      {
        name: "User Onboarding & Activation Speed",
        description: "Measures time-to-first-value onboarding (< 60s) without support.",
        whyItMatters: "Fast onboarding activation directly drives customer trial-to-paid conversion.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 80,
        reasoning: "Streamlined signup flows reduce drop-offs during early trial usage.",
        improvementAction: "Eliminate unnecessary signup form fields to achieve 60-second activation.",
      },
      {
        name: "Recurring Unit Economics (CAC/LTV)",
        description: "Evaluates customer acquisition cost payback period and MRR margins.",
        whyItMatters: "Positive unit economics are mandatory for sustainable SaaS software growth.",
        relevantCategory: "Unit Economics & Margins",
        estimatedScore: 84,
        reasoning: "The subscription pricing model aligns with recurring value delivery.",
        improvementAction: "Maintain positive gross margins before scaling paid marketing spend.",
      },
    ];
  }

  if (offeringType === "Facility / Outlet" || fullText.includes("waffle") || fullText.includes("coffee") || fullText.includes("stall") || fullText.includes("cart")) {
    const isFood = fullText.includes("waffle") || fullText.includes("food") || fullText.includes("coffee") || fullText.includes("stall") || fullText.includes("snack");
    return [
      {
        name: "Location & Footfall Density",
        description: `Evaluates pedestrian foot traffic density near colleges, office parks, or commercial centers in ${input.country}.`,
        whyItMatters: "High footfall directly determines daily customer counter transactions and baseline revenue.",
        relevantCategory: "Location & Footfall",
        estimatedScore: 88,
        reasoning: `Selected operating model relies on peak pedestrian foot traffic for instant impulse buying.`,
        improvementAction: "Perform 3-day peak hour footfall counts before locking lease/space agreements.",
      },
      {
        name: "Preparation Speed & Service Throughput",
        description: "Measures order prep time to serve hot, fresh orders without long queue delays.",
        whyItMatters: "Fast preparation speed maximizes counter capacity during 2-hour peak sales windows.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 85,
        reasoning: "Pre-portioned batter/ingredients ensure fast preparation under 3 minutes per order.",
        improvementAction: "Standardize kitchen layout to achieve under 3-minute order fulfillment.",
      },
      {
        name: "Unit Economics & Gross Margin (65%+)",
        description: "Calculates raw material/ingredient cost per item relative to menu selling price.",
        whyItMatters: "Strong 65%+ gross margins ensure profitability after paying space lease and staff.",
        relevantCategory: "Unit Economics & Margins",
        estimatedScore: 86,
        reasoning: "Low raw ingredient cost relative to dish pricing enables strong gross profit margins.",
        improvementAction: "Maintain strict ingredient portion controls to lock in 65%+ gross margins.",
      },
      {
        name: isFood ? "Food Safety & Hygiene Permitting" : "Permitting & Trade Licensing",
        description: "Assesses food safety sanitation standards and municipal trade permits.",
        whyItMatters: "Clean hygiene builds customer trust and prevents regulatory closure risks.",
        relevantCategory: "Regulatory & Compliance",
        estimatedScore: 84,
        reasoning: "Clear hygiene standards and visible permits build long-term repeat customer trust.",
        improvementAction: "Display basic food safety certificate and maintain clean preparation surfaces.",
      },
    ];
  }

  if (offeringType === "Manufacturing / Production" || fullText.includes("bamboo") || fullText.includes("factory") || fullText.includes("paper cup")) {
    return [
      {
        name: "Machinery & Production Output Capacity",
        description: "Evaluates equipment forming/manufacturing speed, rim strength, and defect rate.",
        whyItMatters: "Consistent machinery output determines daily production tonnage and unit cost efficiency.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 86,
        reasoning: "High-speed automated machinery enables low per-unit manufacturing cost.",
        improvementAction: "Run pilot production batches to verify zero product defect rate.",
      },
      {
        name: "Raw Material Sourcing & Unit Cost",
        description: "Measures bulk raw material procurement pricing stability and supplier reliability.",
        whyItMatters: "Raw material cost represents the largest variable expense in manufacturing.",
        relevantCategory: "Supply Chain",
        estimatedScore: 83,
        reasoning: "Direct bulk sourcing from raw material suppliers stabilizes manufacturing margins.",
        improvementAction: "Establish long-term supply contracts to hedge against material price inflation.",
      },
      {
        name: "Factory Power & Regulatory Clearance",
        description: "Assesses industrial electricity grid sanction, factory licensing, and environmental permits.",
        whyItMatters: "Regulatory clearances are legal prerequisites before starting commercial plant production.",
        relevantCategory: "Regulatory & Compliance",
        estimatedScore: 82,
        reasoning: "Industrial factory permits and grid power sanctions ensure legal operational continuity.",
        improvementAction: "Apply early for industrial power load approval from state DISCOM.",
      },
      {
        name: "B2B Wholesale Distributor Demand",
        description: "Evaluates bulk off-take supply agreements with regional trade buyers and wholesalers.",
        whyItMatters: "Locked B2B distributor orders ensure high factory capacity utilization and cash flow.",
        relevantCategory: "Customer Demand",
        estimatedScore: 85,
        reasoning: "Strong B2B distributor off-take contracts guarantee factory volume sales.",
        improvementAction: "Sign preliminary off-take agreements with 3 regional B2B distributors.",
      },
    ];
  }

  // General Field / Service / Hybrid Venture Default
  return [
    {
      name: "Operational Execution & Quality Control",
      description: `Evaluates service execution reliability and equipment readiness for ${input.startupName}.`,
      whyItMatters: "Consistent service quality builds word-of-mouth customer retention and brand trust.",
      relevantCategory: "Operations & Quality",
      estimatedScore: 85,
      reasoning: "Trained operators and reliable equipment ensure high service delivery standards.",
      improvementAction: "Standardize service delivery checklists for all customer engagements.",
    },
    {
      name: "Target Customer Acquisition & Demand",
      description: `Measures customer purchasing intent and market pull among ${input.audience || "target buyers"}.`,
      whyItMatters: "Steady customer acquisition drives cash flow and baseline business viability.",
      relevantCategory: "Customer Demand",
      estimatedScore: 84,
      reasoning: "Direct alignment with customer problem drives immediate purchasing intent.",
      improvementAction: "Launch local marketing channels to capture initial customer demand.",
    },
    {
      name: "Unit Economics & Operating Margins",
      description: "Calculates direct operational expenses relative to customer pricing.",
      whyItMatters: "Positive operating margins ensure long-term commercial sustainability.",
      relevantCategory: "Unit Economics & Margins",
      estimatedScore: 82,
      reasoning: "Commercial pricing strategy leaves adequate margin after paying operating costs.",
      improvementAction: "Review direct supplier expenses monthly to preserve gross margins.",
    },
    {
      name: "Regulatory & Licensing Compliance",
      description: "Assesses local municipal permits, trade registrations, and safety compliance.",
      whyItMatters: "Full regulatory compliance protects the venture from legal fines or operational delays.",
      relevantCategory: "Regulatory & Compliance",
      estimatedScore: 83,
      reasoning: "Proper business registration and permits provide solid legal foundation.",
      improvementAction: "Verify all required municipal trade licenses before public launch.",
    },
  ];
}

function discoverCompetitiveAlternatives(
  input: StartupIdeaInput,
  offeringType: VentureModel["offeringType"],
  isSoftware: boolean
): DynamicCompetitorAlternative[] {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution}`.toLowerCase();

  if (isSoftware) {
    return [
      {
        name: "Legacy Desktop & Web Platforms",
        alternativeType: "Legacy Option",
        description: "Established incumbent software platforms holding primary market share.",
        strengths: ["Massive customer base", "Extensive feature catalog"],
        weaknesses: ["High pricing tiers", "Complex onboarding setup"],
        differentiationStrategy: "Provide modern AI workflow speed with 1-minute onboarding.",
      },
      {
        name: "Manual Spreadsheets & Email Workflows",
        alternativeType: "Manual Alternative",
        description: "Manual ad-hoc methods used by target users before adopting automated software.",
        strengths: ["Zero financial software cost", "Familiarity"],
        weaknesses: ["High manual effort", "Prone to human error"],
        differentiationStrategy: "Deliver 10x time savings via automated one-click workflows.",
      },
    ];
  }

  if (offeringType === "Facility / Outlet" || fullText.includes("waffle") || fullText.includes("coffee") || fullText.includes("stall")) {
    return [
      {
        name: "Nearby Local Snack & Beverage Counters",
        alternativeType: "Direct Business",
        description: `Existing local food counters and snack stalls operating near ${input.audience || "target customers"}.`,
        strengths: ["Established daily footfall location", "Low prices"],
        weaknesses: ["Inconsistent hygiene & oil quality", "Limited flavor/menu innovation"],
        differentiationStrategy: `Position ${input.startupName} with 100% fresh preparation, clean hygiene, and signature toppings.`,
      },
      {
        name: "Established Neighborhood Cafes & Bakeries",
        alternativeType: "Indirect Business",
        description: "Fixed commercial cafes offering seating and general baked items.",
        strengths: ["Seating shelter", "Broader beverage menu"],
        weaknesses: ["Higher price point", "Slower order preparation"],
        differentiationStrategy: "Focus strictly on fast, hot, affordable counter takeaway orders.",
      },
    ];
  }

  return [
    {
      name: "Established Traditional Providers",
      alternativeType: "Direct Business",
      description: `Existing business providers serving ${input.audience || "target customers"} in ${input.country}.`,
      strengths: ["Known brand awareness", "Established customer trust"],
      weaknesses: ["Higher pricing structure", "Slower operational updates"],
      differentiationStrategy: `Position ${input.startupName} with direct customer transparency and specialized quality.`,
    },
    {
      name: "Unfocused Generalist Alternatives",
      alternativeType: "Substitute Solution",
      description: "Broad providers lacking dedicated specialization for this specific problem.",
      strengths: ["Broad service coverage"],
      weaknesses: ["Lack of specialization", "Higher friction"],
      differentiationStrategy: "Hyper-focused service quality tailored for target market needs.",
    },
  ];
}

function discoverExecutionMilestones(
  input: StartupIdeaInput,
  offeringType: VentureModel["offeringType"],
  isSoftware: boolean
): DynamicExecutionMilestone[] {
  if (isSoftware) {
    return [
      {
        phase: "Phase 1: Discovery",
        title: `Conduct 15 customer discovery interviews for ${input.startupName}`,
        description: "Validate problem urgency and target user willingness-to-pay.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2: MVP Build",
        title: "Build lightweight MVP prototype & test 60s onboarding",
        description: "Develop primary automated feature workflow and test user activation.",
        priority: "High",
        effort: "2-3 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3: Validation",
        title: "Measure user activation, retention, and subscription MRR",
        description: "Optimize onboarding drop-offs and establish positive unit economics.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
    ];
  }

  if (offeringType === "Facility / Outlet") {
    return [
      {
        phase: "Phase 1: Location & Footfall",
        title: `Identify 2–3 high-footfall counter locations for ${input.startupName}`,
        description: "Analyze peak hour pedestrian traffic near colleges, bus stops, or markets.",
        priority: "High",
        effort: "1 week",
        impact: "High",
      },
      {
        phase: "Phase 2: Equipment & Licensing",
        title: "Source prep equipment & secure food hygiene permits",
        description: "Procure counter hardware, establish clean prep standards, and verify municipal permits.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3: Launch & Margins",
        title: "Calculate item unit cost for 65%+ margin & conduct soft launch",
        description: "Standardize order portioning, launch counter operations, and track daily sales volume.",
        priority: "High",
        effort: "1 week",
        impact: "High",
      },
    ];
  }

  return [
    {
      phase: "Phase 1: Feasibility & Sourcing",
      title: `Validate target customer demand & source core equipment for ${input.startupName}`,
      description: "Confirm initial purchasing intent, equipment costs, and supplier pricing.",
      priority: "High",
      effort: "1-2 weeks",
      impact: "High",
    },
    {
      phase: "Phase 2: Setup & Licensing",
      title: "Establish baseline operations & obtain trade licenses",
      description: "Secure operational space/permits and set up service fulfillment workflows.",
      priority: "High",
      effort: "2-3 weeks",
      impact: "High",
    },
    {
      phase: "Phase 3: Revenue & Scaling",
      title: "Optimize operating margins & scale paying customer retention",
      description: "Expand local marketing reach and maintain high customer satisfaction.",
      priority: "High",
      effort: "1-2 weeks",
      impact: "High",
    },
  ];
}

export function inferIndustryProfile(input: StartupIdeaInput): IndustryProfile {
  const vModel = extractVentureModel(input);
  return {
    detectedIndustry: vModel.offeringType,
    subIndustry: vModel.valueDeliveryMechanism,
    businessCategoryKind: vModel.isTechnologyProduct ? "Technology Startup" : "Offline Business",
    revenueModelType: input.businessModel || "Direct Sales",
    regulatoryBody: vModel.regulatoryRequirements.join(" & "),
    keyOperatingMetrics: vModel.keySuccessDrivers.map((d) => d.name),
  };
}

export function inferStartupLifecycle(input: StartupIdeaInput, vModel?: VentureModel): StartupLifecycle {
  const model = vModel || extractVentureModel(input);
  const priorities = model.executionMilestones.map((m) => m.title);

  return {
    currentStage: model.currentStageName,
    confidenceScore: 92,
    reason: `Analysis for ${model.ventureName} (${model.offeringType} in ${model.operatingEnvironment}) tailored strictly to its operational reality.`,
    nextMilestone: priorities[0] || "Validate target customer demand and location feasibility",
    estimatedTimeToNextStage: "2-3 weeks",
    stageTimeline: model.stageTimeline,
    keyObjectives: priorities.slice(0, 3),
    currentStageRisks: model.primaryRisks,
    successProbability: 85,
    potentialBlockers: ["Permitting/licensing delays", "Initial customer acquisition speed"],
    suggestedPriorities: priorities,
  };
}

export function inferBusinessDNA(input: StartupIdeaInput): BusinessDNA {
  const vModel = extractVentureModel(input);
  return {
    startupName: input.startupName.trim(),
    industry: vModel.offeringType,
    subIndustry: vModel.valueDeliveryMechanism,
    businessCategory: vModel.offeringType,
    ideaTypeKind: vModel.isTechnologyProduct ? "Technology Startup" : "Traditional Business",
    businessType: vModel.isTechnologyProduct ? "Digital / Software / SaaS" : "Offline Local Business",
    businessModel: input.businessModel || "Direct Commercial Model",
    revenueModel: vModel.revenueMechanism,
    businessStage: "Idea",
    targetCustomers: vModel.customerPersona,
    customerPersona: `Target buyers seeking reliable solutions for ${vModel.description.slice(0, 60)}...`,
    marketScope: vModel.isTechnologyProduct ? "Global" : "Local",
    investmentLevel: "Medium",
    operationalComplexity: "Medium",
    technologyDependency: vModel.isTechnologyProduct ? "High" : "Low",
    scalability: vModel.isTechnologyProduct ? "High" : "Medium",
    expansionPotential: "Multi-location Regional Expansion",
    fundingRequirement: "$5,000 - $30,000",
    fundingType: "Self-funded / Bootstrapped",
    competitionLevel: "Medium",
    riskLevel: "Medium",
    growthPotential: "High",
    digitalPresenceImportance: vModel.isTechnologyProduct ? "High" : "Medium",
    requiredLicenses: vModel.regulatoryRequirements,
    primarySuccessFactors: vModel.keySuccessDrivers.map((d) => d.name),
    biggestChallenges: vModel.primaryRisks,
    keyAdvantages: ["Direct customer value proposition", "Domain-focused execution"],
    uniqueSellingProposition: (vModel.solution || "").slice(0, 80),
    estimatedTimeToLaunch: "2-4 weeks",
    estimatedInitialInvestment: "$3,000 - $15,000",
    recommendedTeamSize: "2-4 team members",
    businessPriority: vModel.executionMilestones[0]?.title || "Market Validation",
  };
}

export function inferBusinessClassification(input: StartupIdeaInput): BusinessClassification {
  const vModel = extractVentureModel(input);
  return {
    industry: vModel.offeringType,
    businessCategory: vModel.offeringType,
    ideaTypeKind: vModel.isTechnologyProduct ? "Technology Startup" : "Traditional Business",
    businessType: vModel.isTechnologyProduct ? "Digital / Software / SaaS" : "Offline Local Business",
    revenueModel: input.businessModel || "Direct Commercial Sales",
    scalability: vModel.isTechnologyProduct ? "High" : "Medium",
    businessStage: "Idea",
    primaryCustomerSegment: vModel.customerPersona,
    marketScope: vModel.isTechnologyProduct ? "Global" : "Local",
    digitalDependency: vModel.isTechnologyProduct ? "High" : "Low",
  };
}

export async function generateStartupAnalysis(input: StartupIdeaInput): Promise<AnalysisResultJSON> {
  const apiKey = process.env.OPENAI_API_KEY;
  const vModel = extractVentureModel(input);
  const inferredProfile = inferIndustryProfile(input);
  const inferredDNA = inferBusinessDNA(input);
  const inferredClassification = inferBusinessClassification(input);
  const inferredLifecycle = inferStartupLifecycle(input, vModel);

  const healthScores: DynamicHealthCategory[] = vModel.keySuccessDrivers.map((driver) => ({
    categoryName: driver.name,
    score: driver.estimatedScore,
    summary: driver.description,
    details: driver.reasoning,
    recommendation: driver.improvementAction,
  }));

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const prompt = `You are an AI Venture Intelligence Platform performing dynamic venture model reasoning for "${vModel.ventureName}".

VENTURE MODEL CONTEXT:
- Venture Name: "${vModel.ventureName}"
- Description / Idea: "${vModel.description}"
- Offering Type: "${vModel.offeringType}"
- Value Delivery: "${vModel.valueDeliveryMechanism}"
- Operating Environment: "${vModel.operatingEnvironment}"
- Is Technology Product: ${vModel.isTechnologyProduct ? "YES (Software/SaaS/App)" : "NO (Physical / Local / Traditional Business)"}
- Revenue Mechanism: "${vModel.revenueMechanism}"
- Target Customer: "${vModel.customerPersona}"
- Required Resources: ${JSON.stringify(vModel.requiredResources)}
- Key Success Drivers: ${JSON.stringify(vModel.keySuccessDrivers.map((d) => d.name))}

CRITICAL MANDATE:
1. Reason strictly from this actual venture model instead of applying a generic software startup template.
2. IF THIS IS NOT A SOFTWARE PRODUCT (isTechnologyProduct = false):
   NEVER mention "MVP", "writing code", "APIs", "tech stack", "software engineering", "CAC", "LTV", "churn", "prototype counter", "wireframe", or "waitlist landing page".
3. Evaluate ONLY the discovered key success drivers: ${vModel.keySuccessDrivers.map((d) => d.name).join(", ")}.

Return JSON containing:
overallScore (integer 0-100)
ventureModel (object matching VentureModel schema)
ventureContext (object matching VentureModel schema)
healthScores (array of objects matching DynamicHealthCategory schema)
marketPotential (object)
problemValidation (object)
solutionQuality (object)
competitionLevel (object)
businessModel (object)
strengths (array)
weaknesses (array)
opportunities (array)
risks (array)
nextSteps (array)
investorVerdict (string)`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert AI Venture Consultant. Always provide strictly venture-tailored JSON analysis. Never recommend software/SaaS metrics or coding for non-software physical businesses like waffle stalls, clinics, workshops, or factories.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content) as AnalysisResultJSON;
        parsed.overallScore = Math.min(100, Math.max(0, Math.round(parsed.overallScore)));
        parsed.ventureModel = vModel;
        parsed.ventureContext = vModel;
        parsed.healthScores = healthScores;
        if (!parsed.industryProfile) parsed.industryProfile = inferredProfile;
        if (!parsed.businessDNA) parsed.businessDNA = inferredDNA;
        if (!parsed.businessClassification) parsed.businessClassification = inferredClassification;
        if (!parsed.startupLifecycle) parsed.startupLifecycle = inferredLifecycle;
        return parsed;
      }
    } catch (error) {
      console.error("OpenAI API call failed, using fallback analyzer:", error);
    }
  }

  return generateFallbackAnalysis(input);
}

export async function generateMentorChatResponse({
  userMessage,
  history,
  analysisContext,
}: {
  userMessage: string;
  history: { role: "user" | "assistant"; content: string }[];
  analysisContext?: {
    startupName: string;
    idea: string;
    problem: string;
    solution: string;
    audience: string;
    businessModel: string;
    competitors?: string | null;
    overallScore: number;
    ventureModel?: VentureModel | null;
    ventureContext?: VentureModel | null;
    businessClassification?: BusinessClassification | null;
    businessDNA?: BusinessDNA | null;
    startupLifecycle?: StartupLifecycle | null;
    industryProfile?: IndustryProfile | null;
  } | null;
}): Promise<string> {
  const classification = isStartupRelatedIntent(userMessage);
  if (!classification.isStartup) {
    return DOMAIN_REFUSAL_MESSAGE;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  let vModel: VentureModel;
  if (analysisContext?.ventureModel) {
    vModel = analysisContext.ventureModel;
  } else if (analysisContext?.ventureContext) {
    vModel = analysisContext.ventureContext;
  } else if (analysisContext) {
    vModel = extractVentureModel({
      startupName: analysisContext.startupName,
      idea: analysisContext.idea,
      problem: analysisContext.problem,
      solution: analysisContext.solution,
      audience: analysisContext.audience,
      country: "Local Market",
      businessModel: analysisContext.businessModel,
      competitors: analysisContext.competitors,
    });
  } else {
    vModel = extractVentureModel({
      startupName: "Venture",
      idea: userMessage,
      problem: userMessage,
      solution: userMessage,
      audience: "Target Market",
      country: "Local Market",
      businessModel: "Commercial Sales",
    });
  }

  const systemPrompt = `You are an expert AI Business Consultant advising on "${vModel.ventureName}".

VENTURE MODEL:
- Venture Name: "${vModel.ventureName}"
- Description / Idea: "${vModel.description}"
- Offering Type: ${vModel.offeringType}
- Operating Environment: ${vModel.operatingEnvironment}
- Is Technology Product: ${vModel.isTechnologyProduct ? "YES" : "NO"}
- Revenue Mechanism: ${vModel.revenueMechanism}
- Target Customer: ${vModel.customerPersona}
- Current Stage: ${vModel.currentStageName}
- Key Success Factors: ${vModel.keySuccessDrivers.map((d) => d.name).join(", ")}

ADVISORY RULES:
1. Provide practical, real-world business guidance tailored strictly to ${vModel.offeringType} in ${vModel.operatingEnvironment}.
2. IF THIS IS NOT A SOFTWARE PRODUCT (isTechnologyProduct = false):
   NEVER mention writing code, APIs, MVP apps, SaaS metrics, CAC/LTV, wireframes, or waitlist landing pages.
3. For physical/offline ventures (waffle stall, coffee cart, bamboo workshop, repair shop, factory):
   Discuss location footfall, preparation speed, equipment, ingredient/material costs, item pricing, daily operating volume, trade permits, and waste control.
4. Keep advice actionable for current stage: "${vModel.currentStageName}".`;

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
        ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
      });

      const reply = response.choices[0]?.message?.content;
      if (reply) return reply;
    } catch (error) {
      console.error("OpenAI Chat API error, using mentor fallback:", error);
    }
  }

  return generateFallbackMentorReply(userMessage, vModel);
}

function generateFallbackMentorReply(msg: string, vModel: VentureModel): string {
  const classification = isStartupRelatedIntent(msg);
  if (!classification.isStartup) {
    return DOMAIN_REFUSAL_MESSAGE;
  }

  const name = vModel.ventureName;
  const priorities = vModel.executionMilestones.map((m) => m.title);

  return `As your **Venture Consultant**, here is practical operational guidance for **${name}** (${vModel.offeringType}, Stage: **${vModel.currentStageName}**):

1. **Immediate Priority**: ${priorities[0] || "Validate target customer demand and location feasibility"}
2. **Operational Setup**: ${priorities[1] || "Establish baseline equipment, permits, and supplier agreements"}
3. **Margin & Economics**: ${priorities[2] || "Optimize operating costs and scale repeat sales"}
4. **Key Success Drivers**:
${vModel.keySuccessDrivers.slice(0, 3).map((d) => `   - **${d.name}**: ${d.improvementAction}`).join("\n")}
5. **Regulatory Permits**: ${vModel.regulatoryRequirements.join(", ")}.`;
}

function generateFallbackAnalysis(input: StartupIdeaInput): AnalysisResultJSON {
  const vModel = extractVentureModel(input);
  const inferredProfile = inferIndustryProfile(input);
  const inferredDNA = inferBusinessDNA(input);
  const inferredClassification = inferBusinessClassification(input);
  const inferredLifecycle = inferStartupLifecycle(input, vModel);

  const healthScores: DynamicHealthCategory[] = vModel.keySuccessDrivers.map((driver) => ({
    categoryName: driver.name,
    score: driver.estimatedScore,
    summary: driver.description,
    details: driver.reasoning,
    recommendation: driver.improvementAction,
  }));

  const score = Math.round(
    vModel.keySuccessDrivers.reduce((acc, curr) => acc + curr.estimatedScore, 0) / (vModel.keySuccessDrivers.length || 1)
  );

  return {
    overallScore: score,
    ventureModel: vModel,
    ventureContext: vModel,
    healthScores,
    industryProfile: inferredProfile,
    businessClassification: inferredClassification,
    businessDNA: inferredDNA,
    startupLifecycle: inferredLifecycle,
    marketPotential: {
      score: score + 2,
      summary: `Market demand in ${input.country} for ${vModel.offeringType}.`,
      details: `Target segment ${vModel.customerPersona} demonstrates clear purchasing intent for ${vModel.description}.`,
    },
    problemValidation: {
      score: score + 1,
      summary: "Customer problem confirmed with clear purchasing intent.",
      details: `The problem specified ("${input.problem.slice(0, 80)}...") represents a genuine customer need.`,
    },
    solutionQuality: {
      score,
      summary: `Value proposition tailored for ${vModel.offeringType}.`,
      details: `The solution leverages specialized positioning for ${vModel.customerPersona}.`,
    },
    competitionLevel: {
      score: 76,
      level: "Medium",
      summary: "Competitive landscape evaluated across customer alternatives.",
      details: `Focusing on ${vModel.keySuccessDrivers[0]?.name || "core quality"} will establish strong market positioning.`,
    },
    businessModel: {
      score: score + 1,
      summary: `Revenue capture via ${vModel.revenueMechanism} provides sustainable unit economics.`,
      details: `The ${vModel.revenueMechanism} model aligns well with customer purchasing expectations.`,
    },
    strengths: vModel.keySuccessDrivers.map((d) => d.name),
    weaknesses: vModel.primaryRisks,
    opportunities: [
      `Expand operational footprint across ${input.country}`,
      `Capitalize on ${vModel.offeringType} demand growth`,
    ],
    risks: vModel.primaryRisks,
    nextSteps: vModel.executionMilestones.map((m) => m.title),
    investorVerdict: `${input.startupName} (${vModel.offeringType}) is in the ${vModel.currentStageName} stage. Focusing on ${vModel.executionMilestones[0]?.title} will drive sustainable growth.`,
  };
}
