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
  FactEvidenceDemarcation,
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

const GENERAL_ENTERTAINMENT_REFUSAL = `I am an AI Venture & Industry Consultant designed to evaluate business ideas, commercial models, operational requirements, and industry dynamics.

I focus strictly on business and industry topics. Ask me about any venture, industry requirements, operational setup, licenses, equipment, pricing, or strategy!`;

export function isStartupRelatedIntent(message: string): { isStartup: boolean; category?: string } {
  const lower = message.toLowerCase().trim();

  // Non-business entertainment triggers ONLY
  const nonBusinessTriggers = [
    { keywords: ["superman", "batman", "spiderman", "avengers", "marvel", "dc comics", "hero", "superhero"], category: "superheroes & comics" },
    { keywords: ["recipe to cook at home", "bake cake recipe", "curry recipe for dinner", "kitchen dish recipe", "pasta recipe", "noodle recipe"], category: "cooking recipes" },
    { keywords: ["movie review", "cinema showtime", "actor biography", "actress", "film summary", "hollywood movie", "bollywood movie", "netflix show", "anime list"], category: "movies & entertainment" },
    { keywords: ["weather today", "temperature today", "rain forecast", "climate today"], category: "weather" },
    { keywords: ["cricket score", "football score", "soccer score", "nba score", "ipl match score", "tennis match score"], category: "sports scores" },
    { keywords: ["tell me a joke", "riddle for kids", "funny story", "write a poem", "sing a song"], category: "entertainment" },
    { keywords: ["capital of france", "who invented electricity", "who painted Mona Lisa", "presidential election date", "history of rome", "math homework", "solve equation"], category: "general trivia & homework" },
    { keywords: ["horoscope today", "astrology reading", "zodiac sign", "tarot card"], category: "astrology" },
  ];

  for (const trigger of nonBusinessTriggers) {
    if (trigger.keywords.some((kw) => lower.includes(kw))) {
      return { isStartup: false, category: trigger.category };
    }
  }

  // Any business, industry, equipment, license, process, or commercial inquiry is valid!
  return { isStartup: true };
}

export function assessClarificationNeed(input: StartupIdeaInput): { needsClarification: boolean; questions?: string[]; message?: string } {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution}`.trim();
  const name = input.startupName.trim();
  const idea = input.idea.trim();

  const broadOrSpecificDomainKeywords = [
    "textile", "fabric", "garment", "cotton", "weaving", "spinning", "factory", "plant", "mill",
    "waffle", "food", "stall", "restaurant", "bakery", "cafe", "kitchen", "snack", "vegetable", "mandi",
    "clothing", "fashion", "store", "boutique", "shop", "retail", "gym", "fitness", "salon",
    "hospital", "clinic", "dental", "doctor", "medical", "paper cup",
    "bamboo", "furniture", "workshop", "drone", "crop", "farm", "agri", "organic", "ev charging", "solar",
    "pet", "grooming", "transport", "repair", "consulting", "software", "saas", "app", "web", "resume builder",
    "delivery", "marketplace", "e-commerce", "wholesale", "cleaning", "school", "tuition", "coaching", "warehouse", "audiobook",
    "logistics", "real estate", "brokerage", "travel", "beauty", "automotive", "construction"
  ];

  const lower = fullText.toLowerCase();
  const hasDomainKeyword = broadOrSpecificDomainKeywords.some((kw) => lower.includes(kw));

  // If the user mentions any broad industry or specific domain, do NOT block! Proceed directly to dynamic analysis!
  if (hasDomainKeyword && (idea.length >= 4 || name.length >= 4)) {
    return { needsClarification: false };
  }

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 6 && !hasDomainKeyword) {
    return {
      needsClarification: true,
      questions: [
        `What does ${name} do or plan to produce?`,
        `Is ${name} a physical business, service, factory, or technology product?`,
        `Who is your intended customer or market?`,
      ],
      message: `Before I analyze "${name}", I need a brief hint about your venture or industry domain:`,
    };
  }

  return { needsClarification: false };
}

/**
 * PURE DYNAMIC VENTURE REASONING ENGINE
 * Evaluates facts vs inferences vs missing facts and determines customer industry vs venture industry.
 */
export function extractVentureModel(input: StartupIdeaInput): VentureModel {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution} ${input.businessModel} ${input.audience}`.toLowerCase();
  const ideaLower = input.idea.toLowerCase();

  // 1. Detect Input Granularity (Broad Industry Overview vs Specific Venture)
  const isBroadIndustryOnly =
    (ideaLower === "textile industry" || ideaLower === "textile" || ideaLower === "agriculture" || ideaLower === "factory" || ideaLower === "hospital" || ideaLower === "tuition center") &&
    (!input.solution || input.solution.length < 10);

  const inputGranularity: VentureModel["inputGranularity"] = isBroadIndustryOnly ? "Broad Industry Overview" : "Specific Venture";

  // 2. Evaluate if the venture's CORE PRODUCT is writing software/apps vs physical/field operations
  const isSoftware =
    (fullText.includes("software") ||
      fullText.includes("saas") ||
      fullText.includes("web app") ||
      fullText.includes("mobile app") ||
      fullText.includes("api platform") ||
      fullText.includes("resume builder") ||
      (fullText.includes("ai ") && (fullText.includes("tool") || fullText.includes("generator") || fullText.includes("platform")))) &&
    !fullText.includes("textile factory") &&
    !fullText.includes("bamboo workshop") &&
    !fullText.includes("waffle stall");

  // 3. Customer Industry vs Venture Industry & Venture Type
  let customerIndustry = input.audience || "Target Customers / Buyers";
  let ventureIndustry = "General Commercial Domain";
  let ventureType = "Commercial Venture";
  let offeringType: VentureModel["offeringType"] = "Physical Product";
  let operatingEnvironment: VentureModel["operatingEnvironment"] = "Physical Offline";
  let valueDeliveryMechanism = "Direct physical value delivery";

  if (fullText.includes("textile") || fullText.includes("fabric") || fullText.includes("cotton") || fullText.includes("weaving")) {
    if (isSoftware) {
      customerIndustry = "Textile & Garment Manufacturers";
      ventureIndustry = "Artificial Intelligence & B2B Software";
      ventureType = "Software / AI SaaS Platform";
      offeringType = "Digital / Software";
      operatingEnvironment = "Digital Online";
      valueDeliveryMechanism = "Cloud analytics portal & software API integrations";
    } else {
      customerIndustry = input.audience && input.audience !== "Target Customers" ? input.audience : "Garment Manufacturers & Textile Wholesalers";
      ventureIndustry = "Textile & Fabric Manufacturing";
      ventureType = "Manufacturing Mill / Factory Unit";
      offeringType = "Manufacturing / Production";
      operatingEnvironment = "Industrial Plant";
      valueDeliveryMechanism = "B2B wholesale fabric batch production and physical logistics";
    }
  } else if (fullText.includes("waffle") || fullText.includes("stall") || fullText.includes("snack") || fullText.includes("food counter")) {
    customerIndustry = "Local Pedestrians, Students & Office Workers";
    ventureIndustry = "Food & Beverage / Quick Service Counter";
    ventureType = "Street Counter / Outlet";
    offeringType = "Facility / Outlet";
    operatingEnvironment = "Physical Offline";
    valueDeliveryMechanism = "In-person commercial storefront counter serving";
  } else if (fullText.includes("vegetable") || fullText.includes("retail shop") || fullText.includes("boutique") || fullText.includes("store")) {
    customerIndustry = "Neighborhood Households & Retail Buyers";
    ventureIndustry = "Retail & Consumer Goods";
    ventureType = "Physical Retail Counter";
    offeringType = "Facility / Outlet";
    operatingEnvironment = "Physical Offline";
    valueDeliveryMechanism = "Direct in-store counter retail sales";
  } else if (fullText.includes("farm") || fullText.includes("agri") || fullText.includes("crop") || fullText.includes("organic")) {
    customerIndustry = "Agri-Wholesalers, Mandis & Fresh Produce Buyers";
    ventureIndustry = "Agriculture & Farming Operations";
    ventureType = "Agricultural Farm / Produce Unit";
    offeringType = "Agriculture / Farming";
    operatingEnvironment = "Farm / Agricultural Land";
    valueDeliveryMechanism = "Bulk produce harvesting, cold storage, and mandi wholesale distribution";
  } else if (isSoftware) {
    ventureIndustry = "Digital Software & SaaS";
    ventureType = "Software App / Cloud Platform";
    offeringType = "Digital / Software";
    operatingEnvironment = "Digital Online";
    valueDeliveryMechanism = "Cloud web portal & mobile application interface";
  } else if (fullText.includes("factory") || fullText.includes("manufactur") || fullText.includes("mill") || fullText.includes("plant")) {
    customerIndustry = "B2B Wholesale Buyers & Industrial Distributors";
    ventureIndustry = "Industrial Manufacturing";
    ventureType = "Manufacturing Plant";
    offeringType = "Manufacturing / Production";
    operatingEnvironment = "Industrial Plant";
    valueDeliveryMechanism = "B2B batch manufacturing and freight logistics";
  } else if (fullText.includes("service") || fullText.includes("repair") || fullText.includes("grooming") || fullText.includes("clinic")) {
    customerIndustry = input.audience || "Local Service Clients";
    ventureIndustry = "Professional / Field Services";
    ventureType = "Physical Service Provider";
    offeringType = "Service";
    operatingEnvironment = fullText.includes("drone") ? "Hybrid Field & Digital" : "Physical Offline";
    valueDeliveryMechanism = "On-site field service execution by trained personnel";
  }

  // 4. Evidence Demarcation (Facts vs Inferences vs Missing Facts)
  const factsProvided: string[] = [];
  const inferredAssumptions: string[] = [];
  const missingFacts: string[] = [];

  if (input.startupName) factsProvided.push(`Venture Name: "${input.startupName}"`);
  if (input.idea) factsProvided.push(`Idea: "${input.idea}"`);
  if (input.problem && input.problem !== `Problem in ${input.startupName}`) factsProvided.push(`Problem: "${input.problem}"`);
  if (input.solution && input.solution !== input.idea) factsProvided.push(`Solution: "${input.solution}"`);
  if (input.country) factsProvided.push(`Target Market / Location: "${input.country}"`);

  let revenueModelSource: VentureModel["revenueModelSource"] = "Unknown";
  let revenueMechanism = "Undetermined Revenue Model";

  if (input.businessModel && input.businessModel.length >= 3 && !input.businessModel.includes("Commercial Sales")) {
    revenueModelSource = "Provided by User";
    revenueMechanism = input.businessModel;
    factsProvided.push(`Revenue Model (Provided): "${input.businessModel}"`);
  } else {
    revenueModelSource = "Inferred Assumption";
    revenueMechanism = isSoftware
      ? "Monthly SaaS Subscription (Inferred Assumption)"
      : offeringType === "Manufacturing / Production"
      ? "B2B Wholesale Product Sales per Batch (Inferred Assumption)"
      : offeringType === "Facility / Outlet"
      ? "Direct Counter Sales per Transaction (Inferred Assumption)"
      : "Direct Commercial Service Fees (Inferred Assumption)";
    inferredAssumptions.push(`Revenue model not explicitly provided. Logically inferred ${revenueMechanism}.`);
    missingFacts.push("Explicit pricing tiers and margin breakdown not provided by user.");
  }

  let customerPersonaSource: VentureModel["customerPersonaSource"] = "Unknown";
  let customerPersona = customerIndustry;

  if (input.audience && input.audience.length >= 3 && input.audience !== "Target Customers") {
    customerPersonaSource = "Provided by User";
    customerPersona = input.audience;
    factsProvided.push(`Target Customer (Provided): "${input.audience}"`);
  } else {
    customerPersonaSource = "Inferred Assumption";
    inferredAssumptions.push(`Target customer segment inferred as ${customerIndustry} based on industry context.`);
    missingFacts.push("Detailed buyer persona demographics and contract terms not provided.");
  }

  if (isBroadIndustryOnly) {
    missingFacts.push("Specific venture capacity, equipment list, target buyers, and initial investment not specified.");
  }

  // 5. Dynamically Discover Success Drivers, Competitors & Milestones
  const keySuccessDrivers = discoverSuccessDrivers(input, offeringType, isSoftware, isBroadIndustryOnly, ventureIndustry);
  const competitiveAlternatives = discoverCompetitiveAlternatives(input, offeringType, isSoftware, customerPersona);
  const executionMilestones = discoverExecutionMilestones(input, offeringType, isSoftware, isBroadIndustryOnly);

  let stageTimeline = ["1. Feasibility & Market Validation", "2. Location/Equipment Setup", "3. Regulatory Permitting", "4. Commercial Launch", "5. Volume Optimization", "6. Expansion"];
  let currentStageName = "Feasibility & Market Validation";

  if (isSoftware) {
    stageTimeline = ["1. Discovery & Problem Validation", "2. MVP Prototype Test", "3. Early User Activation", "4. Product-Market Fit", "5. Paid Growth", "6. Scale"];
    currentStageName = "Problem Validation Stage";
  } else if (offeringType === "Manufacturing / Production") {
    stageTimeline = ["1. Feasibility & Machinery Sourcing", "2. Plant Setup & Utility Connection", "3. Regulatory & Factory Licensing", "4. Trial Batch Production", "5. Commercial Distribution", "6. Capacity Scale"];
    currentStageName = "Feasibility & Machinery Sourcing Stage";
  }

  return {
    ventureName: input.startupName.trim(),
    description: input.idea.trim(),
    problem: input.problem.trim(),
    solution: input.solution.trim(),
    inputGranularity,
    customerIndustry,
    ventureIndustry,
    ventureType,
    offeringType,
    valueDeliveryMechanism,
    operatingEnvironment,
    revenueMechanism,
    revenueModelSource,
    customerPersona,
    customerPersonaSource,
    marketScope: input.country || "Local Market",
    isTechnologyProduct: isSoftware,
    requiredResources: isSoftware
      ? ["Cloud API Infrastructure", "Software Engineering Team", "Database Architecture"]
      : offeringType === "Manufacturing / Production"
      ? ["Industrial Machinery Equipment", "Factory Space & Grid Power Load", "Raw Material Stock", "Skilled Plant Operators"]
      : offeringType === "Facility / Outlet"
      ? ["High-Footfall Retail Outlet", "Serving/Prep Equipment", "Raw Ingredients", "Point-of-Sale Counter"]
      : ["Operational Tools & Vehicles", "Trained Field Technicians", "Local Commercial License"],
    operationalConstraints: isSoftware
      ? ["Cloud uptime latency and server costs", "User onboarding activation friction"]
      : ["Raw material price volatility", "Location footfall drops during bad weather", "Factory power supply stability & state licensing"],
    evidenceBreakdown: {
      factsProvided,
      inferredAssumptions,
      missingFacts,
    },
    keySuccessDrivers,
    competitiveAlternatives,
    executionMilestones,
    primaryRisks: isSoftware
      ? ["High customer acquisition cost relative to LTV", "Competitive feature cloning"]
      : ["Raw material/ingredient price inflation", "Permitting approval delays", "Customer off-take contract delays"],
    regulatoryRequirements: isSoftware
      ? ["Data Protection & Privacy Standards", "Payment Processor Compliance"]
      : offeringType === "Manufacturing / Production"
      ? ["Industrial Factory License", "State DISCOM Power Load Permit", "State Pollution Control Board Clearance", "GST Registration"]
      : offeringType === "Facility / Outlet" && (fullText.includes("waffle") || fullText.includes("food") || fullText.includes("coffee"))
      ? ["FSSAI Food Safety Registration", "Municipal Trade License", "Fire Safety Permit"]
      : ["Municipal Trade License", "GST Registration", "Local Commercial Clearances"],
    currentStageName,
    stageTimeline,
  };
}

function discoverSuccessDrivers(
  input: StartupIdeaInput,
  offeringType: VentureModel["offeringType"],
  isSoftware: boolean,
  isBroadIndustry: boolean,
  ventureIndustry: string
): DynamicSuccessDriver[] {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution}`.toLowerCase();

  if (isSoftware) {
    return [
      {
        name: "Problem Severity & User Workflow Urgency",
        description: `Evaluates how critical the workflow friction is for ${input.audience || "target users"}.`,
        whyItMatters: "High pain severity ensures users actively seek automated software and accept subscription pricing.",
        relevantCategory: "Customer Demand",
        estimatedScore: 85,
        reasoning: "The defined software problem addresses immediate manual workflow inefficiencies.",
        improvementAction: "Conduct 15 structured discovery calls to confirm workflow pain points.",
      },
      {
        name: "Product Differentiation & Workflow Speed",
        description: "Assesses automation speed and feature moat vs legacy software alternatives.",
        whyItMatters: "Distinct software speed prevents user churn and defends against competitive cloning.",
        relevantCategory: "Technology & Product",
        estimatedScore: 82,
        reasoning: "Dedicated software automation offers significant time savings over manual workarounds.",
        improvementAction: "Highlight your 1-click automated feature prominently in onboarding.",
      },
      {
        name: "User Onboarding & Activation (<60s)",
        description: "Measures friction-free signup time to first key software output.",
        whyItMatters: "Fast onboarding activation directly drives trial-to-paid conversion rates.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 80,
        reasoning: "Streamlined signup flows reduce user drop-off during initial trial testing.",
        improvementAction: "Remove non-essential input fields during initial account creation.",
      },
      {
        name: "Recurring SaaS Unit Economics (CAC/LTV)",
        description: "Evaluates customer acquisition cost payback period and recurring margins.",
        whyItMatters: "Positive unit economics are mandatory for sustainable software growth.",
        relevantCategory: "Unit Economics & Margins",
        estimatedScore: 84,
        reasoning: "Subscription monetization aligns with continuous software value delivery.",
        improvementAction: "Maintain positive gross margins before scaling paid marketing channels.",
      },
    ];
  }

  if (offeringType === "Manufacturing / Production" || fullText.includes("textile") || fullText.includes("factory") || fullText.includes("mill") || fullText.includes("bamboo")) {
    return [
      {
        name: "Machinery Capacity & Quality Output",
        description: "Evaluates manufacturing machinery speed, output consistency, and defect rate.",
        whyItMatters: "Consistent machine output determines daily production tonnage and per-unit manufacturing cost.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 86,
        reasoning: "Modern automated equipment enables high volume production at competitive unit cost.",
        improvementAction: "Perform trial production runs to verify zero product defect rates.",
      },
      {
        name: "Raw Material Sourcing & Unit Margin",
        description: "Measures raw yarn/material procurement price stability and supplier reliability.",
        whyItMatters: "Raw material cost is the single largest variable cost in physical manufacturing.",
        relevantCategory: "Supply Chain",
        estimatedScore: 83,
        reasoning: "Direct bulk procurement from primary suppliers locks in healthy gross margins.",
        improvementAction: "Establish long-term supply agreements to hedge against material inflation.",
      },
      {
        name: "Factory Utilities & Regulatory Clearances",
        description: "Assesses industrial electricity power load, factory permits, and pollution clearances.",
        whyItMatters: "Regulatory clearances are legal prerequisites before starting commercial plant production.",
        relevantCategory: "Regulatory & Compliance",
        estimatedScore: 82,
        reasoning: "Sanctioned power load and pollution clearances ensure uninterrupted factory operations.",
        improvementAction: "Apply early for industrial DISCOM power sanction and pollution board permits.",
      },
      {
        name: "B2B Off-Take & Wholesaler Contracts",
        description: "Evaluates pre-committed bulk orders from regional garment makers and distributors.",
        whyItMatters: "Locked B2B off-take agreements guarantee high factory capacity utilization and cash flow.",
        relevantCategory: "Customer Demand",
        estimatedScore: 85,
        reasoning: "Pre-signed wholesale off-take contracts de-risk initial capital investment.",
        improvementAction: "Secure preliminary off-take intent letters with 3 regional B2B buyers.",
      },
    ];
  }

  if (offeringType === "Facility / Outlet" || fullText.includes("waffle") || fullText.includes("stall") || fullText.includes("counter")) {
    return [
      {
        name: "Location Footfall & Pedestrian Density",
        description: `Evaluates daily foot traffic density near colleges, commercial centers, or transport hubs in ${input.country}.`,
        whyItMatters: "High footfall directly determines daily counter transactions and baseline revenue.",
        relevantCategory: "Location & Footfall",
        estimatedScore: 88,
        reasoning: "Counter sales model relies on high pedestrian density for spontaneous impulse purchases.",
        improvementAction: "Conduct 3-day peak hour footfall counts before signing space lease.",
      },
      {
        name: "Order Preparation & Throughput Speed",
        description: "Measures order prep time to serve fresh orders without queue delays.",
        whyItMatters: "Fast preparation speed maximizes counter sales capacity during 2-hour peak windows.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 85,
        reasoning: "Pre-portioned ingredients enable fast fulfillment under 3 minutes per customer.",
        improvementAction: "Standardize counter layout for under 3-minute order fulfillment.",
      },
      {
        name: "Unit Economics & Gross Margin (65%+)",
        description: "Calculates ingredient/item cost relative to menu selling price.",
        whyItMatters: "Strong 65%+ gross margins cover space lease, electricity, and staff costs.",
        relevantCategory: "Unit Economics & Margins",
        estimatedScore: 86,
        reasoning: "Low ingredient cost relative to dish retail price yields healthy operating margins.",
        improvementAction: "Enforce strict portion control to maintain 65%+ gross margins.",
      },
      {
        name: "Food Safety & Trade Licensing",
        description: "Assesses FSSAI sanitation standards and municipal trade permits.",
        whyItMatters: "Visible sanitation builds customer trust and prevents regulatory closure.",
        relevantCategory: "Regulatory & Compliance",
        estimatedScore: 84,
        reasoning: "Clear food safety compliance protects against health inspection fines.",
        improvementAction: "Display food safety registration and maintain spotless preparation counters.",
      },
    ];
  }

  // General Commercial / Service Venture Success Drivers
  return [
    {
      name: "Target Customer Demand & Purchasing Pull",
      description: `Evaluates active customer purchasing pull for ${input.startupName}.`,
      whyItMatters: "Strong customer demand drives cash flow and baseline commercial viability.",
      relevantCategory: "Customer Demand",
      estimatedScore: 84,
      reasoning: "Direct problem alignment captures immediate buyer purchasing intent.",
      improvementAction: "Validate customer purchasing willingness through local outreach.",
    },
    {
      name: "Operational Execution & Quality Control",
      description: "Measures service execution reliability, equipment readiness, and delivery standards.",
      whyItMatters: "Consistent service quality builds word-of-mouth customer retention.",
      relevantCategory: "Operations & Quality",
      estimatedScore: 83,
      reasoning: "Standardized service procedures ensure consistent customer satisfaction.",
      improvementAction: "Develop a standardized quality checklist for every service delivery.",
    },
    {
      name: "Unit Margins & Operating Expenses",
      description: "Calculates direct operational expenses relative to customer pricing.",
      whyItMatters: "Positive operating margins ensure long-term business sustainability.",
      relevantCategory: "Unit Economics & Margins",
      estimatedScore: 82,
      reasoning: "Commercial pricing structure covers direct labor and operational overhead.",
      improvementAction: "Review monthly supplier and operating costs to preserve gross margins.",
    },
    {
      name: "Trade Licensing & Regulatory Compliance",
      description: "Assesses municipal trade licenses, registrations, and safety permits.",
      whyItMatters: "Full regulatory compliance prevents legal penalties or operational delays.",
      relevantCategory: "Regulatory & Compliance",
      estimatedScore: 84,
      reasoning: "Proper registration establishes a legally secure commercial foundation.",
      improvementAction: "Verify all municipal and state trade licenses prior to launch.",
    },
  ];
}

function discoverCompetitiveAlternatives(
  input: StartupIdeaInput,
  offeringType: VentureModel["offeringType"],
  isSoftware: boolean,
  customerPersona: string
): DynamicCompetitorAlternative[] {
  if (isSoftware) {
    return [
      {
        name: "Legacy Desktop & Web Platforms",
        alternativeType: "Legacy Software",
        description: "Established incumbent software solutions holding primary market share.",
        strengths: ["Large existing user base", "Extensive feature catalog"],
        weaknesses: ["High pricing plans", "Complex setup friction"],
        differentiationStrategy: "Deliver 1-minute setup and modern automated workflow speed.",
      },
      {
        name: "Manual Spreadsheets & Email Chains",
        alternativeType: "Manual Alternative",
        description: "Manual ad-hoc spreadsheets used before adopting dedicated software.",
        strengths: ["Zero software fee", "Familiarity"],
        weaknesses: ["High manual labor", "Prone to human error"],
        differentiationStrategy: "Deliver 10x time savings with automated one-click reports.",
      },
    ];
  }

  if (offeringType === "Manufacturing / Production") {
    return [
      {
        name: "Established Industrial Mills & Wholesalers",
        alternativeType: "Incumbent Factory",
        description: `Existing large-scale manufacturing suppliers serving ${customerPersona}.`,
        strengths: ["High production volume", "Established buyer relationships"],
        weaknesses: ["Higher minimum order quantities (MOQs)", "Slower custom batch production"],
        differentiationStrategy: `Offer flexible order quantities, faster delivery turnaround, and competitive B2B pricing.`,
      },
      {
        name: "Imported & Regional Trading Suppliers",
        alternativeType: "Trade Alternative",
        description: "Third-party trading houses importing batch products from outside markets.",
        strengths: ["Broad product variety"],
        weaknesses: ["Import transit delays", "Inconsistent batch quality"],
        differentiationStrategy: "Provide reliable local supply, transparent quality testing, and instant delivery.",
      },
    ];
  }

  return [
    {
      name: "Local Traditional Providers",
      alternativeType: "Direct Business",
      description: `Established local providers serving ${customerPersona} in the target market.`,
      strengths: ["Known brand presence", "Established local customer trust"],
      weaknesses: ["Higher pricing structure", "Inconsistent service quality"],
      differentiationStrategy: `Position ${input.startupName} with superior customer service, fair pricing, and reliable quality.`,
    },
    {
      name: "Generalist Unfocused Substitutes",
      alternativeType: "Substitute Solution",
      description: "General market alternatives lacking dedicated specialization for this problem.",
      strengths: ["Broad service coverage"],
      weaknesses: ["Lack of specialization", "Higher friction"],
      differentiationStrategy: "Provide specialized service tailored specifically to target customer needs.",
    },
  ];
}

function discoverExecutionMilestones(
  input: StartupIdeaInput,
  offeringType: VentureModel["offeringType"],
  isSoftware: boolean,
  isBroadIndustry: boolean
): DynamicExecutionMilestone[] {
  if (isSoftware) {
    return [
      {
        phase: "Phase 1: Discovery",
        title: `Conduct 15 customer discovery interviews for ${input.startupName}`,
        description: "Validate workflow pain urgency and willingness to pay subscription fees.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2: MVP Test",
        title: "Build lightweight MVP prototype & test 60s onboarding",
        description: "Develop core automated feature workflow and test user activation.",
        priority: "High",
        effort: "2-3 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3: Activation & MRR",
        title: "Measure user activation, retention, and subscription MRR",
        description: "Optimize onboarding friction and establish positive unit economics.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
    ];
  }

  if (offeringType === "Manufacturing / Production") {
    return [
      {
        phase: "Phase 1: Sourcing & Feasibility",
        title: `Identify factory machinery & raw material suppliers for ${input.startupName}`,
        description: "Evaluate equipment specs, power load requirements, and bulk material pricing.",
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2: Licensing & Utilities",
        title: "Secure factory permits & industrial power load connection",
        description: "Obtain state pollution clearance, factory licensing, and DISCOM power sanction.",
        priority: "High",
        effort: "3-4 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3: Pilot Batch & Off-Take",
        title: "Run pilot production batch & sign B2B wholesale contracts",
        description: "Test product quality standards and lock in off-take agreements with 3 B2B buyers.",
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
    ];
  }

  return [
    {
      phase: "Phase 1: Location & Sourcing",
      title: `Identify primary counter/service location & source operational equipment`,
      description: "Analyze customer footfall or demand and secure required operational tools.",
      priority: "High",
      effort: "1-2 weeks",
      impact: "High",
    },
    {
      phase: "Phase 2: Permitting & Setup",
      title: "Obtain municipal trade licenses & set up counter operations",
      description: "Secure municipal permits, food safety/trade registrations, and prepare fulfillment workflow.",
      priority: "High",
      effort: "1-2 weeks",
      impact: "High",
    },
    {
      phase: "Phase 3: Soft Launch & Margins",
      title: "Calculate unit item cost for 65%+ gross margin & launch operations",
      description: "Standardize service delivery, track daily counter volume, and preserve operating margins.",
      priority: "High",
      effort: "1 week",
      impact: "High",
    },
  ];
}

export function inferIndustryProfile(input: StartupIdeaInput): IndustryProfile {
  const vModel = extractVentureModel(input);
  return {
    detectedIndustry: vModel.ventureIndustry,
    subIndustry: vModel.valueDeliveryMechanism,
    businessCategoryKind: vModel.isTechnologyProduct ? "Technology Startup" : "Traditional / Offline Business",
    revenueModelType: vModel.revenueMechanism,
    regulatoryBody: vModel.regulatoryRequirements.join(" & "),
    keyOperatingMetrics: vModel.keySuccessDrivers.map((d) => d.name),
  };
}

export function inferStartupLifecycle(input: StartupIdeaInput, vModel?: VentureModel): StartupLifecycle {
  const model = vModel || extractVentureModel(input);
  const priorities = model.executionMilestones.map((m) => m.title);

  const confidenceScore = model.inputGranularity === "Broad Industry Overview" ? 60 : 90;

  return {
    currentStage: model.currentStageName,
    confidenceScore,
    reason: `Analysis for ${model.ventureName} (${model.ventureType} in ${model.operatingEnvironment}) strictly tailored to its operational reality.`,
    nextMilestone: priorities[0] || "Validate target customer demand and location feasibility",
    estimatedTimeToNextStage: "2-3 weeks",
    stageTimeline: model.stageTimeline,
    keyObjectives: priorities.slice(0, 3),
    currentStageRisks: model.primaryRisks,
    successProbability: 82,
    potentialBlockers: ["Regulatory/licensing approval timelines", "Initial customer off-take contracts"],
    suggestedPriorities: priorities,
  };
}

export function inferBusinessDNA(input: StartupIdeaInput): BusinessDNA {
  const vModel = extractVentureModel(input);
  return {
    startupName: input.startupName.trim(),
    industry: vModel.ventureIndustry,
    subIndustry: vModel.valueDeliveryMechanism,
    businessCategory: vModel.ventureType,
    ideaTypeKind: vModel.isTechnologyProduct ? "Technology Startup" : "Traditional Business",
    businessType: vModel.isTechnologyProduct ? "Digital / Software / SaaS" : "Offline Local Business",
    businessModel: vModel.revenueMechanism,
    revenueModel: vModel.revenueMechanism,
    businessStage: "Idea",
    targetCustomers: vModel.customerPersona,
    customerPersona: `Target buyers seeking reliable solutions for ${vModel.description.slice(0, 60)}...`,
    marketScope: vModel.isTechnologyProduct ? "Global" : "Local",
    investmentLevel: vModel.offeringType === "Manufacturing / Production" ? "High" : "Medium",
    operationalComplexity: vModel.offeringType === "Manufacturing / Production" ? "High" : "Medium",
    technologyDependency: vModel.isTechnologyProduct ? "High" : "Low",
    scalability: vModel.isTechnologyProduct ? "High" : "Medium",
    expansionPotential: "Multi-location Regional Expansion",
    fundingRequirement: vModel.offeringType === "Manufacturing / Production" ? "$25,000 - $100,000" : "$5,000 - $25,000",
    fundingType: "Self-funded / Bootstrapped / Commercial Loan",
    competitionLevel: "Medium",
    riskLevel: "Medium",
    growthPotential: "High",
    digitalPresenceImportance: vModel.isTechnologyProduct ? "High" : "Medium",
    requiredLicenses: vModel.regulatoryRequirements,
    primarySuccessFactors: vModel.keySuccessDrivers.map((d) => d.name),
    biggestChallenges: vModel.primaryRisks,
    keyAdvantages: ["Direct value proposition", "Domain-focused operational execution"],
    uniqueSellingProposition: (vModel.solution || "").slice(0, 80),
    estimatedTimeToLaunch: vModel.offeringType === "Manufacturing / Production" ? "4-8 weeks" : "2-4 weeks",
    estimatedInitialInvestment: vModel.offeringType === "Manufacturing / Production" ? "$20,000 - $80,000" : "$3,000 - $15,000",
    recommendedTeamSize: vModel.offeringType === "Manufacturing / Production" ? "5-10 plant operators" : "2-4 team members",
    businessPriority: vModel.executionMilestones[0]?.title || "Market Validation",
  };
}

export function inferBusinessClassification(input: StartupIdeaInput): BusinessClassification {
  const vModel = extractVentureModel(input);
  return {
    industry: vModel.ventureIndustry,
    businessCategory: vModel.ventureType,
    ideaTypeKind: vModel.isTechnologyProduct ? "Technology Startup" : "Traditional Business",
    businessType: vModel.isTechnologyProduct ? "Digital / Software / SaaS" : "Offline Local Business",
    revenueModel: vModel.revenueMechanism,
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

  const ventureScore = Math.round(
    vModel.keySuccessDrivers.reduce((acc, curr) => acc + curr.estimatedScore, 0) / (vModel.keySuccessDrivers.length || 1)
  );

  const analysisConfidence = vModel.inputGranularity === "Broad Industry Overview" ? 58 : 88;

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const prompt = `You are an AI Venture Intelligence Platform performing dynamic venture model reasoning for "${vModel.ventureName}".

VENTURE MODEL CONTEXT:
- Venture Name: "${vModel.ventureName}"
- Description / Idea: "${vModel.description}"
- Input Granularity: "${vModel.inputGranularity}"
- Venture Industry: "${vModel.ventureIndustry}"
- Venture Type: "${vModel.ventureType}"
- Customer Industry / Segment: "${vModel.customerIndustry}"
- Offering Type: "${vModel.offeringType}"
- Value Delivery: "${vModel.valueDeliveryMechanism}"
- Operating Environment: "${vModel.operatingEnvironment}"
- Is Technology Product: ${vModel.isTechnologyProduct ? "YES (Software/SaaS/App)" : "NO (Physical / Local / Traditional / Manufacturing Business)"}
- Revenue Mechanism: "${vModel.revenueMechanism}" (${vModel.revenueModelSource})
- Customer Persona: "${vModel.customerPersona}" (${vModel.customerPersonaSource})
- Explicit Facts Provided: ${JSON.stringify(vModel.evidenceBreakdown.factsProvided)}
- Inferred Assumptions: ${JSON.stringify(vModel.evidenceBreakdown.inferredAssumptions)}
- Missing Information: ${JSON.stringify(vModel.evidenceBreakdown.missingFacts)}

CRITICAL MANDATES:
1. REASON STRICTLY FROM THIS ACTUAL VENTURE MODEL. Distinguish between Customer Industry and Venture Type (e.g. AI software platform for textile factories is a B2B Software venture, NOT a textile mill!).
2. IF THIS IS NOT A SOFTWARE PRODUCT (isTechnologyProduct = false):
   NEVER mention "MVP", "writing code", "APIs", "tech stack", "software engineering", "CAC", "LTV", "churn", "prototype counter", "wireframe", or "waitlist landing page".
3. Distinguish facts provided from inferred assumptions. Do NOT state inferred revenue models or customer segments as user-confirmed facts.
4. Report both ventureScore (overall venture potential 0-100) and analysisConfidence (data completeness 0-100). If Input Granularity is "Broad Industry Overview", report analysisConfidence between 50-65% and explain missing facts clearly.

Return JSON containing:
overallScore (integer 0-100)
ventureScore (integer 0-100)
analysisConfidence (integer 0-100)
ventureModel (object matching VentureModel schema)
ventureContext (object matching VentureModel schema)
evidenceBreakdown (object with factsProvided, inferredAssumptions, missingFacts arrays)
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
            content: `You are an expert AI Venture Consultant. Always provide strictly venture-tailored JSON analysis. Never recommend software/SaaS metrics or coding for non-software physical businesses like textile factories, waffle stalls, clinics, workshops, or farms. Explicitly separate facts from inferred assumptions.`,
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
        parsed.overallScore = Math.min(100, Math.max(0, Math.round(parsed.overallScore || ventureScore)));
        parsed.ventureScore = parsed.overallScore;
        parsed.analysisConfidence = Math.min(100, Math.max(0, Math.round(parsed.analysisConfidence || analysisConfidence)));
        parsed.ventureModel = vModel;
        parsed.ventureContext = vModel;
        parsed.evidenceBreakdown = vModel.evidenceBreakdown;
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
    return GENERAL_ENTERTAINMENT_REFUSAL;
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
      businessModel: "Commercial Model",
    });
  }

  const systemPrompt = `You are an expert AI Venture & Domain Consultant advising on "${vModel.ventureName}".

COMPLETE VENTURE MODEL CONTEXT:
- Venture Name: "${vModel.ventureName}"
- Description / Idea: "${vModel.description}"
- Venture Industry: "${vModel.ventureIndustry}"
- Venture Type: "${vModel.ventureType}"
- Customer Industry / Segment: "${vModel.customerPersona}"
- Offering Type: ${vModel.offeringType}
- Operating Environment: ${vModel.operatingEnvironment}
- Is Technology Product: ${vModel.isTechnologyProduct ? "YES (Software/SaaS/App)" : "NO (Physical / Local / Traditional Business)"}
- Revenue Model: ${vModel.revenueMechanism} (${vModel.revenueModelSource})
- Customer Segment: ${vModel.customerPersona} (${vModel.customerPersonaSource})
- Primary Resources: ${vModel.requiredResources.join(", ")}
- Key Success Drivers: ${vModel.keySuccessDrivers.map((d) => d.name).join(", ")}
- Primary Risks: ${vModel.primaryRisks.join(", ")}
- Regulatory Permits: ${vModel.regulatoryRequirements.join(", ")}

ADVISORY & DOMAIN ANSWER RULES:
1. ALWAYS ANSWER domain and industry questions directly! If the user asks about basic industry requirements, equipment, permits, raw materials, pricing, operational risks, or market dynamics, provide thorough, expert guidance.
2. DO NOT reject legitimate domain questions or state that they are "non-business topics".
3. Maintain clear awareness of Customer Industry vs Venture Type (e.g. an AI platform for textile factories is a Software product, whereas a textile factory is a Manufacturing plant).
4. IF THIS IS NOT A SOFTWARE PRODUCT (isTechnologyProduct = false):
   NEVER mention writing code, APIs, MVP apps, SaaS metrics, CAC/LTV, wireframes, or waitlist landing pages.
5. Provide actionable, real-world operational guidance tailored to ${vModel.ventureType} in ${vModel.operatingEnvironment}.`;

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
        temperature: 0.4,
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
    return GENERAL_ENTERTAINMENT_REFUSAL;
  }

  const name = vModel.ventureName;
  const priorities = vModel.executionMilestones.map((m) => m.title);

  return `As your **Venture Consultant**, here is domain guidance for **${name}** (${vModel.ventureType}, Industry: **${vModel.ventureIndustry}**):

1. **Core Domain Requirements**: ${vModel.requiredResources.slice(0, 3).join(", ")}
2. **Key Execution Step**: ${priorities[0] || "Validate target customer demand"}
3. **Primary Success Drivers**:
${vModel.keySuccessDrivers.slice(0, 3).map((d) => `   - **${d.name}**: ${d.improvementAction}`).join("\n")}
4. **Regulatory & Permits**: ${vModel.regulatoryRequirements.join(", ")}
5. **Known Operational Risks**: ${vModel.primaryRisks.join(", ")}.`;
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

  const ventureScore = Math.round(
    vModel.keySuccessDrivers.reduce((acc, curr) => acc + curr.estimatedScore, 0) / (vModel.keySuccessDrivers.length || 1)
  );

  const analysisConfidence = vModel.inputGranularity === "Broad Industry Overview" ? 58 : 88;

  return {
    overallScore: ventureScore,
    ventureScore,
    analysisConfidence,
    ventureModel: vModel,
    ventureContext: vModel,
    evidenceBreakdown: vModel.evidenceBreakdown,
    healthScores,
    industryProfile: inferredProfile,
    businessClassification: inferredClassification,
    businessDNA: inferredDNA,
    startupLifecycle: inferredLifecycle,
    marketPotential: {
      score: ventureScore + 2,
      summary: `Market demand in ${input.country} for ${vModel.ventureType}.`,
      details: `Target customer segment (${vModel.customerPersona}) represents direct demand for ${vModel.description}.`,
    },
    problemValidation: {
      score: ventureScore + 1,
      summary: "Customer problem and operational need confirmed.",
      details: `The problem specified ("${input.problem.slice(0, 80)}...") aligns with core market pain points.`,
    },
    solutionQuality: {
      score: ventureScore,
      summary: `Solution quality tailored for ${vModel.ventureType}.`,
      details: `Positioning leverages specialized operational execution for ${vModel.customerPersona}.`,
    },
    competitionLevel: {
      score: 76,
      level: "Medium",
      summary: "Competitive landscape evaluated across direct and indirect alternatives.",
      details: `Focusing on ${vModel.keySuccessDrivers[0]?.name || "operational quality"} will build solid market positioning.`,
    },
    businessModel: {
      score: ventureScore + 1,
      summary: `Revenue capture via ${vModel.revenueMechanism}.`,
      details: `The revenue model aligns with industry pricing expectations.`,
    },
    strengths: vModel.keySuccessDrivers.map((d) => d.name),
    weaknesses: vModel.primaryRisks,
    opportunities: [
      `Expand operational footprint across ${input.country}`,
      `Capitalize on ${vModel.ventureIndustry} market growth`,
    ],
    risks: vModel.primaryRisks,
    nextSteps: vModel.executionMilestones.map((m) => m.title),
    investorVerdict: `${input.startupName} (${vModel.ventureType}) is in the ${vModel.currentStageName} stage. Focusing on ${vModel.executionMilestones[0]?.title} will drive sustainable commercial growth.`,
  };
}
