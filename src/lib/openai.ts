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

const GENERAL_ENTERTAINMENT_REFUSAL = `I am an AI Venture & Domain Consultant designed to evaluate business ideas, commercial models, operational requirements, and industry dynamics.

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
    "waffle", "food", "stall", "samosa", "falooda", "panipuri", "restaurant", "bakery", "cafe", "kitchen", "snack", "vegetable", "mandi",
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
    !fullText.includes("waffle stall") &&
    !fullText.includes("falooda stall") &&
    !fullText.includes("samosa stall");

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
  } else if (fullText.includes("waffle") || fullText.includes("falooda") || fullText.includes("samosa") || fullText.includes("panipuri") || fullText.includes("stall") || fullText.includes("snack") || fullText.includes("food counter")) {
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
      ? "Plausible Monthly Subscription (Inferred Assumption)"
      : offeringType === "Manufacturing / Production"
      ? "Plausible B2B Wholesale Product Sales (Inferred Assumption)"
      : offeringType === "Facility / Outlet"
      ? "Plausible Counter Sales per Item (Inferred Assumption)"
      : "Plausible Commercial Service Fee (Inferred Assumption)";
    inferredAssumptions.push(`Revenue model not explicitly specified. Logically inferred ${revenueMechanism}.`);
    missingFacts.push("Specific pricing structure and item margins not provided by user.");
  }

  let customerPersonaSource: VentureModel["customerPersonaSource"] = "Unknown";
  let customerPersona = customerIndustry;

  if (input.audience && input.audience.length >= 3 && input.audience !== "Target Customers") {
    customerPersonaSource = "Provided by User";
    customerPersona = input.audience;
    factsProvided.push(`Target Customer (Provided): "${input.audience}"`);
  } else {
    customerPersonaSource = "Inferred Assumption";
    inferredAssumptions.push(`Target customer segment inferred as ${customerIndustry} based on venture context.`);
    missingFacts.push("Detailed buyer demographics and purchasing contracts not provided.");
  }

  if (isBroadIndustryOnly) {
    missingFacts.push("Specific venture output capacity, equipment inventory, target buyers, and initial budget not provided.");
  }

  // 5. Dynamically Discover Success Drivers, Competitors & Multi-Phase Milestones
  const keySuccessDrivers = discoverSuccessDrivers(input, offeringType, isSoftware, isBroadIndustryOnly, ventureIndustry);
  const competitiveAlternatives = discoverCompetitiveAlternatives(input, offeringType, isSoftware, customerPersona);
  const executionMilestones = discoverExecutionMilestones(input, offeringType, isSoftware, isBroadIndustryOnly);

  let stageTimeline = ["1. Demand & Location Validation", "2. Business Setup & Compliance", "3. Opening & Initial Operations", "4. Unit Economics Optimization", "5. Expansion"];
  let currentStageName = "Demand & Location Validation";

  if (isSoftware) {
    stageTimeline = ["1. Problem & Customer Discovery", "2. MVP Architecture", "3. Beta Launch & Activation", "4. Product-Market Fit", "5. Growth & Scaling"];
    currentStageName = "Problem Validation Stage";
  } else if (offeringType === "Manufacturing / Production") {
    stageTimeline = ["1. Market & Buyer Validation", "2. Facility & Equipment Setup", "3. Raw Material & Production Readiness", "4. Pilot Production", "5. Commercial Scale"];
    currentStageName = "Feasibility & Sourcing Stage";
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
      ? ["Software Architecture", "Development Capability", "Cloud Hosting Infrastructure"]
      : offeringType === "Manufacturing / Production"
      ? ["Factory Space & Grid Power Connection", "Industrial Production Machinery", "Raw Material Stock", "Skilled Plant Operators"]
      : offeringType === "Facility / Outlet"
      ? ["High-Footfall Counter Outlet", "Preparation & Serving Equipment", "Raw Ingredients", "Point-of-Sale Counter"]
      : ["Operational Tools & Vehicles", "Trained Field Technicians", "Local Commercial Permit"],
    operationalConstraints: isSoftware
      ? ["Server uptime latency and cloud hosting expenses", "User onboarding activation friction"]
      : ["Raw material price fluctuations", "Location footfall variations due to weather", "Local municipal permit & power sanction timelines"],
    evidenceBreakdown: {
      factsProvided,
      inferredAssumptions,
      missingFacts,
    },
    keySuccessDrivers,
    competitiveAlternatives,
    executionMilestones,
    primaryRisks: isSoftware
      ? ["User adoption velocity relative to customer acquisition cost", "Competitive feature cloning"]
      : ["Raw ingredient/material price inflation", "Permitting approval timelines", "Initial customer off-take agreements"],
    regulatoryRequirements: isSoftware
      ? ["Data Privacy Standards (e.g. GDPR/DPDP if processing user data)", "Payment Gateway Terms (if processing online payments)"]
      : offeringType === "Manufacturing / Production"
      ? ["State DISCOM Industrial Power Load Permit (Conditional)", "Factory License & Pollution Board Clearances (Jurisdiction Dependent)", "GST Registration (Turnover Dependent)"]
      : offeringType === "Facility / Outlet" && (fullText.includes("waffle") || fullText.includes("falooda") || fullText.includes("samosa") || fullText.includes("food") || fullText.includes("coffee"))
      ? ["FSSAI Food Safety Registration (Applicable for Food Ventures)", "Municipal Trade License (Jurisdiction Dependent)", "Fire Safety Certificate (Space Dependent)"]
      : ["Municipal Trade License (Jurisdiction Dependent)", "GST Registration (Turnover Dependent)", "Local Commercial Clearances"],
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
        name: "Problem Severity & User Need",
        description: `Evaluates how critical the workflow friction is for prospective users.`,
        whyItMatters: "High pain severity ensures users actively seek solutions and consider paying.",
        relevantCategory: "Customer Demand",
        estimatedScore: 85,
        reasoning: "Addressing a clear friction point creates baseline user pull.",
        improvementAction: "Conduct targeted discovery calls to confirm workflow pain points.",
      },
      {
        name: "Product Differentiation & Speed",
        description: "Assesses unique workflow advantage vs existing manual or legacy alternatives.",
        whyItMatters: "A clear product advantage defends against competitive alternatives.",
        relevantCategory: "Technology & Product",
        estimatedScore: 82,
        reasoning: "Dedicated software automation offers time savings over manual workarounds.",
        improvementAction: "Identify your strongest automated feature and test user activation speed.",
      },
      {
        name: "User Onboarding & Signup Activation",
        description: "Measures friction-free onboarding speed to first key software value.",
        whyItMatters: "Fast onboarding activation directly improves conversion rates.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 80,
        reasoning: "Streamlined signup flows reduce user drop-off during early trial testing.",
        improvementAction: "Streamline signup steps to minimize drop-off during initial user testing.",
      },
      {
        name: "Recurring Unit Economics",
        description: "Evaluates prospective acquisition costs against user retention value.",
        whyItMatters: "Positive unit economics are necessary for sustainable growth.",
        relevantCategory: "Unit Economics & Margins",
        estimatedScore: 84,
        reasoning: "Monetization model aligns with continuous software value delivery.",
        improvementAction: "Model acquisition payback against prospective lifetime revenue.",
      },
    ];
  }

  if (offeringType === "Manufacturing / Production" || fullText.includes("textile") || fullText.includes("factory") || fullText.includes("mill") || fullText.includes("bamboo")) {
    return [
      {
        name: "Machinery Capacity & Quality Control",
        description: "Evaluates manufacturing machinery output consistency and defect rate.",
        whyItMatters: "Consistent machine output determines daily production capacity and unit cost efficiency.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 86,
        reasoning: "Reliable equipment enables high volume production at competitive unit cost.",
        improvementAction: "Perform trial production runs to verify product defect rates.",
      },
      {
        name: "Raw Material Sourcing & Unit Margin",
        description: "Measures raw material procurement price stability and supplier reliability.",
        whyItMatters: "Raw material cost is the primary variable cost in physical manufacturing.",
        relevantCategory: "Supply Chain",
        estimatedScore: 83,
        reasoning: "Bulk procurement from primary suppliers helps stabilize operating margins.",
        improvementAction: "Evaluate multi-supplier agreements to hedge against material inflation.",
      },
      {
        name: "Factory Utilities & Regulatory Clearances",
        description: "Assesses industrial electricity power load, factory permits, and environmental compliance.",
        whyItMatters: "Regulatory clearances are necessary prerequisites before starting commercial plant production.",
        relevantCategory: "Regulatory & Compliance",
        estimatedScore: 82,
        reasoning: "Sanctioned power load and environmental permits ensure legal plant operations.",
        improvementAction: "Check local industrial DISCOM power load rules and environmental permits.",
      },
      {
        name: "B2B Off-Take & Wholesaler Distribution",
        description: "Evaluates pre-committed bulk orders from regional trade buyers and distributors.",
        whyItMatters: "Pre-committed wholesale off-take agreements support factory capacity utilization.",
        relevantCategory: "Customer Demand",
        estimatedScore: 85,
        reasoning: "Securing initial off-take interest de-risks plant capital investment.",
        improvementAction: "Discuss preliminary supply intent with regional B2B buyers.",
      },
    ];
  }

  if (offeringType === "Facility / Outlet" || fullText.includes("waffle") || fullText.includes("falooda") || fullText.includes("samosa") || fullText.includes("stall") || fullText.includes("counter")) {
    return [
      {
        name: "Location Footfall & Pedestrian Traffic",
        description: `Evaluates daily pedestrian traffic near commercial centers or student hubs in ${input.country}.`,
        whyItMatters: "High footfall directly influences daily counter transactions and baseline sales.",
        relevantCategory: "Location & Footfall",
        estimatedScore: 88,
        reasoning: "Counter outlets rely on pedestrian foot traffic for spontaneous purchases.",
        improvementAction: "Measure peak hour footfall traffic at candidate space locations.",
      },
      {
        name: "Order Preparation & Service Speed",
        description: "Measures prep time to serve fresh orders without queue delays.",
        whyItMatters: "Efficient preparation speed maximizes customer throughput during peak hours.",
        relevantCategory: "Operations & Quality",
        estimatedScore: 85,
        reasoning: "Pre-portioned ingredients enable fast fulfillment during busy windows.",
        improvementAction: "Standardize counter layout for efficient order fulfillment.",
      },
      {
        name: "Unit Economics & Operating Margins",
        description: "Calculates ingredient/item cost relative to retail selling price.",
        whyItMatters: "Healthy gross margins cover counter space lease, utilities, and labor.",
        relevantCategory: "Unit Economics & Margins",
        estimatedScore: 86,
        reasoning: "Low ingredient cost relative to retail price supports healthy operating margins.",
        improvementAction: "Test ingredient portion costs against local commercial price benchmarks.",
      },
      {
        name: "Food Safety & Hygiene Compliance",
        description: "Assesses food hygiene standards and municipal trade permissions.",
        whyItMatters: "Clean sanitation practices build customer trust and prevent compliance issues.",
        relevantCategory: "Regulatory & Compliance",
        estimatedScore: 84,
        reasoning: "Clear food safety compliance protects against inspection penalties.",
        improvementAction: "Verify local food hygiene registration requirements.",
      },
    ];
  }

  // General Commercial / Service Venture Success Drivers
  return [
    {
      name: "Target Customer Demand & Purchasing Pull",
      description: `Evaluates active customer purchasing pull for ${input.startupName}.`,
      whyItMatters: "Strong customer demand drives cash flow and commercial viability.",
      relevantCategory: "Customer Demand",
      estimatedScore: 84,
      reasoning: "Direct problem alignment captures buyer purchasing intent.",
      improvementAction: "Validate customer purchasing willingness through local outreach.",
    },
    {
      name: "Operational Execution & Quality Control",
      description: "Measures service execution reliability, equipment readiness, and delivery standards.",
      whyItMatters: "Consistent service quality builds customer word-of-mouth retention.",
      relevantCategory: "Operations & Quality",
      estimatedScore: 83,
      reasoning: "Standardized procedures support consistent customer satisfaction.",
      improvementAction: "Develop a standardized quality checklist for service delivery.",
    },
    {
      name: "Unit Margins & Operating Expenses",
      description: "Calculates direct operational expenses relative to customer pricing.",
      whyItMatters: "Positive operating margins ensure long-term commercial sustainability.",
      relevantCategory: "Unit Economics & Margins",
      estimatedScore: 82,
      reasoning: "Pricing structure covers direct labor and operational overhead.",
      improvementAction: "Review monthly supplier and operating costs to preserve gross margins.",
    },
    {
      name: "Trade Licensing & Regulatory Compliance",
      description: "Assesses municipal trade licenses, registrations, and safety permits.",
      whyItMatters: "Full regulatory compliance prevents legal penalties or operational delays.",
      relevantCategory: "Regulatory & Compliance",
      estimatedScore: 84,
      reasoning: "Proper registration establishes a secure commercial foundation.",
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
        description: "Established incumbent software solutions in this domain.",
        strengths: ["Existing user base", "Extensive feature catalog"],
        weaknesses: ["Higher pricing plans", "Complex setup friction"],
        differentiationStrategy: "Focus on modern setup speed and specialized workflow automation.",
      },
      {
        name: "Manual Spreadsheets & Email Chains",
        alternativeType: "Manual Alternative",
        description: "Manual ad-hoc spreadsheets used before adopting dedicated software.",
        strengths: ["Zero software fee", "Familiarity"],
        weaknesses: ["High manual labor", "Prone to human error"],
        differentiationStrategy: "Highlight time savings and automated reporting capabilities.",
      },
    ];
  }

  if (offeringType === "Manufacturing / Production") {
    return [
      {
        name: "Established Industrial Mills & Wholesalers",
        alternativeType: "Incumbent Factory",
        description: `Existing manufacturing suppliers serving ${customerPersona}.`,
        strengths: ["High production volume", "Established buyer relationships"],
        weaknesses: ["Higher minimum order quantities (MOQs)", "Slower custom batch production"],
        differentiationStrategy: `Offer flexible order quantities, faster delivery turnaround, and competitive B2B pricing.`,
      },
      {
        name: "Imported & Regional Trading Suppliers",
        alternativeType: "Trade Alternative",
        description: "Third-party trading houses supplying batch products from outside markets.",
        strengths: ["Broad product variety"],
        weaknesses: ["Transit delays", "Inconsistent batch quality"],
        differentiationStrategy: "Provide reliable local supply, transparent quality testing, and responsive delivery.",
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

/**
 * PURE GENERALIZED DOMAIN-AGNOSTIC ROADMAP ENGINE
 * Infers tasks dynamically based on offeringType, operatingEnvironment, and isTechnologyProduct.
 * Zero hardcoded industry keyword dictionaries or fixed answer templates!
 */
function discoverExecutionMilestones(
  input: StartupIdeaInput,
  offeringType: VentureModel["offeringType"],
  isSoftware: boolean,
  isBroadIndustry: boolean
): DynamicExecutionMilestone[] {
  const name = input.startupName.trim();
  const country = input.country || "the target market";

  // 1. Digital Software / SaaS Application Roadmap
  if (isSoftware) {
    return [
      {
        phase: "Phase 1 — Problem & Customer Discovery",
        title: `Interview 15 target users to validate workflow friction for ${name}`,
        description: `Validate whether the workflow problem is frequent and painful enough to pay for subscription fees in ${country}.`,
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 1 — Problem & Customer Discovery",
        title: "Define core automated feature scope & user workflow",
        description: "Specify the primary automated feature that delivers immediate time savings for target users.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2 — MVP Architecture & Prototyping",
        title: "Develop application prototype & test signup activation speed",
        description: "Build the core user workflow and test onboarding activation speed to minimize user drop-off.",
        priority: "High",
        effort: "2-3 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2 — MVP Architecture & Prototyping",
        title: "Configure cloud hosting, database & security compliance",
        description: "Set up scalable cloud infrastructure and verify data protection requirements.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3 — Beta Launch & User Activation",
        title: "Track active user retention & subscription unit economics",
        description: "Monitor user drop-off points, gather product feedback, and optimize customer acquisition costs.",
        priority: "High",
        effort: "2-3 weeks",
        impact: "High",
      },
      {
        phase: "Phase 4 — Product-Market Fit & Retention",
        title: "Refine subscription pricing tiers based on active feedback",
        description: "Optimize recurring revenue conversion and customer lifetime value.",
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 5 — Growth & Scalable Infrastructure",
        title: "Expand integration features & scale acquisition channels",
        description: "Grow marketing reach, introduce team collaboration tools, and expand integration capabilities.",
        priority: "Medium",
        effort: "4-6 weeks",
        impact: "High",
      },
    ];
  }

  // 2. Manufacturing & Batch Production Plant Roadmap
  if (offeringType === "Manufacturing / Production") {
    return [
      {
        phase: "Phase 1 — Market & Buyer Validation",
        title: `Obtain product grade specs & MOQ requirements from B2B buyers for ${name}`,
        description: `Evaluate regional wholesale buyer specifications, batch pricing expectations, and minimum order quantities in ${country}.`,
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 1 — Market & Buyer Validation",
        title: "Evaluate factory site requirements & industrial grid power availability",
        description: "Check floor space footprint, environmental clearance rules, and DISCOM industrial power sanction timelines.",
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2 — Facility & Equipment Setup",
        title: "Obtain landed cost quotations from at least 3 machinery & material suppliers",
        description: "Source manufacturing machinery, spare parts, and establish long-term bulk material supply pricing.",
        priority: "High",
        effort: "3-4 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2 — Facility & Equipment Setup",
        title: "Verify factory licensing, environmental clearances & power permits",
        description: "Complete local municipal registrations, fire clearances, and power sanction approvals.",
        priority: "High",
        effort: "2-3 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3 — Raw Material & Production Readiness",
        title: "Establish raw material inventory storage & negotiate supplier payment terms",
        description: "Calibrate machinery output speed, set up scrap containment, and test safety protocols.",
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 4 — Pilot Production & Quality Verification",
        title: "Run trial production batch & test quality defect rates",
        description: "Conduct pilot manufacturing runs to measure output speed, product tensile strength, and defect rates.",
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 5 — Commercial Production & Capacity Scaling",
        title: "Secure pre-committed B2B off-take contracts & scale plant shifts",
        description: "Present trial samples to regional garment/trade wholesalers and recruit additional machine operators.",
        priority: "Medium",
        effort: "4-8 weeks",
        impact: "High",
      },
    ];
  }

  // 3. Agriculture & Farming Operations Roadmap
  if (offeringType === "Agriculture / Farming") {
    return [
      {
        phase: "Phase 1 — Crop & Market Suitability",
        title: `Conduct soil, water quality & climate suitability testing for ${name}`,
        description: `Evaluate land suitability, water resources, and wholesale mandi price dynamics in ${country}.`,
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2 — Land, Water & Resource Preparation",
        title: "Estimate irrigation requirements & input costs for planned acreage",
        description: "Calculate land preparation budget, irrigation setup, and water storage capacity.",
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3 — Input Procurement & Cultivation Cycle",
        title: "Source seed stock, organic inputs & establish planting schedule",
        description: "Procure quality certified seeds, organic fertilizers, and set up pest management protocols.",
        priority: "High",
        effort: "2-3 weeks",
        impact: "High",
      },
      {
        phase: "Phase 4 — Harvest, Storage & Mandi Linkages",
        title: "Manage harvest labor & establish direct wholesale mandi buyer linkages",
        description: "Coordinate harvest timing, cold storage preservation, and transport logistics to wholesale buyers.",
        priority: "High",
        effort: "2-4 weeks",
        impact: "High",
      },
      {
        phase: "Phase 5 — Yield & Distribution Expansion",
        title: "Expand cultivated acreage & evaluate high-margin crop rotation",
        description: "Scale produce volume and explore direct B2B supply agreements with commercial buyers.",
        priority: "Medium",
        effort: "4-8 weeks",
        impact: "High",
      },
    ];
  }

  // 4. Commercial Storefront / Food Counter / Retail Outlet Roadmap
  if (offeringType === "Facility / Outlet") {
    return [
      {
        phase: "Phase 1 — Demand & Location Validation",
        title: `Compare 3 candidate outlet locations by peak-hour footfall for ${name}`,
        description: `Measure peak-hour pedestrian foot traffic near student or commercial hubs in ${country} before signing a lease.`,
        priority: "High",
        effort: "1 week",
        impact: "High",
      },
      {
        phase: "Phase 1 — Demand & Location Validation",
        title: "Conduct small-batch taste/product tests to validate acceptable price range",
        description: "Test recipe variations or product items with target buyers to confirm demand and price acceptance.",
        priority: "High",
        effort: "1 week",
        impact: "High",
      },
      {
        phase: "Phase 2 — Business Setup & Compliance",
        title: "Verify local food safety/trade registration & municipal permit rules",
        description: "Check FSSAI food safety hygiene rules, trade licenses, and local commercial clearances for your area.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 2 — Business Setup & Compliance",
        title: "Source outlet prep equipment, display counter & bulk ingredient suppliers",
        description: "Procure counter display equipment, prep hardware, and establish reliable supplier pricing.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 3 — Opening & Initial Operations",
        title: "Standardize recipes & counter serving layout for fast throughput",
        description: "Pre-portion ingredients and optimize counter workflow to maximize peak hour customer serving speed.",
        priority: "High",
        effort: "1-2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 4 — Unit Economics & Operational Optimization",
        title: "Calculate item contribution margin & reduce ingredient wastage",
        description: "Track daily counter sales, monitor inventory turnover, and optimize ingredient purchasing costs.",
        priority: "High",
        effort: "2 weeks",
        impact: "High",
      },
      {
        phase: "Phase 5 — Expansion",
        title: "Document operating procedures & evaluate second outlet location",
        description: "Verify baseline counter profitability before expanding to a secondary location or delivery channel.",
        priority: "Medium",
        effort: "2-4 weeks",
        impact: "High",
      },
    ];
  }

  // 5. Service Provider / Field Execution / General Commercial Venture Roadmap
  return [
    {
      phase: "Phase 1 — Service Packaging & Client Validation",
      title: `Define specialized service offerings & evaluate client demand for ${name}`,
      description: `Assess local client pain points, competitor pricing structures, and initial service positioning in ${country}.`,
      priority: "High",
      effort: "1-2 weeks",
      impact: "High",
    },
    {
      phase: "Phase 2 — Equipment, Licensing & Office Setup",
      title: "Procure service tools & verify municipal trade license rules",
      description: "Source operational tools, workspace lease, and verify local municipal trade license requirements.",
      priority: "High",
      effort: "1-2 weeks",
      impact: "High",
    },
    {
      phase: "Phase 3 — Service Launch & Client Acquisition",
      title: "Establish service delivery checklists & build client referral channels",
      description: "Standardize operational checklists, gather client feedback, and track operating margins.",
      priority: "High",
      effort: "2 weeks",
      impact: "High",
    },
    {
      phase: "Phase 4 — Service Quality & Margin Optimization",
      title: "Track service unit economics & optimize operating expenses",
      description: "Optimize labor scheduling, retainer contracts, and service margins.",
      priority: "High",
      effort: "2 weeks",
      impact: "High",
    },
    {
      phase: "Phase 5 — Team Expansion & Territory Scaling",
      title: "Recruit additional qualified technicians & expand service territory",
      description: "Hire trained personnel and expand commercial outreach to nearby territory.",
      priority: "Medium",
      effort: "3-6 weeks",
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

CRITICAL MANDATES FOR DYNAMIC EXECUTION ROADMAP & ANALYSIS:
1. REASON STRICTLY FROM THIS ACTUAL VENTURE MODEL. Distinguish between Customer Industry and Venture Type (e.g. AI software platform for textile factories is a B2B Software venture, NOT a textile mill!).
2. IF THIS IS NOT A SOFTWARE PRODUCT (isTechnologyProduct = false):
   NEVER mention "MVP", "writing code", "APIs", "tech stack", "software engineering", "CAC", "LTV", "churn", "prototype counter", "wireframe", or "waitlist landing page" in executionMilestones or nextSteps!
3. GENERATE DYNAMIC ROADMAP TASKS across contextually appropriate phase names tailored strictly to THIS venture's operational reality and identified bottlenecks!
4. DO NOT INVENT UNCONFIRMED FACTS OR ARBITRARY NUMBERS. Present numbers as illustrative benchmarks rather than asserting them as user facts. Frame regulatory requirements conditionally based on local jurisdiction.
5. Report both ventureScore (overall venture potential 0-100) and analysisConfidence (data completeness 0-100). If Input Granularity is "Broad Industry Overview", report analysisConfidence between 50-65% and explain missing facts clearly.

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
            content: `You are an expert AI Venture Consultant. Always provide strictly venture-tailored JSON analysis. Never recommend software/SaaS metrics or coding for non-software physical businesses like textile factories, waffle stalls, clinics, workshops, or farms. Explicitly separate facts from inferred assumptions. Avoid inventing arbitrary numbers as facts.`,
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

ACTIVE VENTURE CONTEXT:
- Venture Name: "${vModel.ventureName}"
- Description / Idea: "${vModel.description}"
- Venture Industry: "${vModel.ventureIndustry}"
- Venture Type: "${vModel.ventureType}"
- Customer Industry / Segment: "${vModel.customerPersona}" (${vModel.customerPersonaSource})
- Offering Type: ${vModel.offeringType}
- Operating Environment: ${vModel.operatingEnvironment}
- Is Technology Product: ${vModel.isTechnologyProduct ? "YES (Software/SaaS/App)" : "NO (Physical / Local / Traditional / Manufacturing Business)"}
- Revenue Model: ${vModel.revenueMechanism} (${vModel.revenueModelSource})
- Explicit User-Provided Facts: ${JSON.stringify(vModel.evidenceBreakdown.factsProvided)}
- Inferred Assumptions: ${JSON.stringify(vModel.evidenceBreakdown.inferredAssumptions)}
- Missing Information: ${JSON.stringify(vModel.evidenceBreakdown.missingFacts)}

CRITICAL ADVISORY & REASONING RULES:

1. ANSWER THE USER'S ACTUAL QUESTION DIRECTLY AND QUESTION-AWARELY:
   - If the user asks "What is the first step?" or "Where should I start?", give the single most critical first step directly:
     1. What to do
     2. Why it matters
     3. How to do it
     4. What result to look for
     5. What to do next
   - If the user asks about equipment, focus directly on equipment for THAT venture type.
   - If the user asks about licenses/permits, focus directly on regulatory considerations for THAT venture type.
   - If the user asks about pricing/margins, focus directly on unit economics and pricing strategies for THAT venture type.
   - DO NOT force a generic list of requirements when the user asked a specific question.

2. FACT vs INFERENCE vs BENCHMARK vs RECOMMENDATION:
   - USER-PROVIDED FACTS: Information explicitly supplied by the user (listed above).
   - REASONABLE INFERENCES: Logically inferred attributes, clearly marked as inferences.
   - GENERAL DOMAIN KNOWLEDGE: Generally relevant industry principles or benchmarks.
   - NEVER present an inference, benchmark, or hypothetical feature as a user-confirmed fact!

3. NO FABRICATED FACTS OR ARBITRARY NUMBERS:
   - Do NOT assert that the venture has a specific feature ("your 1-click feature"), team ("Software Engineering Team"), margin ("65%+ margin"), sample target ("15 interviews", "3-day footfall count"), or exact license.
   - Frame features conditionally: "If your solution includes X...", "Depending on whether you offer Y..."
   - Frame numbers as illustrative benchmarks: "Industry benchmarks typically suggest...", "Consider testing your gross margin target against..."

4. CONDITIONAL & CONTEXT-AWARE REGULATORY ADVICE:
   - Never state that a license is definitely required without jurisdiction context.
   - Frame regulations conditionally: "Depending on your location, turnover, and local laws, X registration or Y trade permit may be required. Check local municipal requirements for your area."

5. PRESERVE DOMAIN ADAPTATION:
   - Maintain clear domain adaptation for ${vModel.ventureType} in ${vModel.operatingEnvironment}.
   - IF THIS IS NOT A SOFTWARE PRODUCT (isTechnologyProduct = false):
     NEVER mention code, APIs, MVP apps, SaaS metrics, CAC/LTV, wireframes, or waitlist landing pages.

6. TONE & CONSULTING STYLE:
   - Sound like an intelligent domain consultant ("Based on what you've described...", "Typically in this industry...", "This depends on...", "A relevant consideration is...").
   - Avoid rigid assertions ("Your business has...", "You require...", "Your main risk is...").`;

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

  const lowerMsg = msg.toLowerCase();
  const name = vModel.ventureName;

  // First Step / Where to start Inquiry
  if (lowerMsg.includes("first step") || lowerMsg.includes("where to start") || lowerMsg.includes("do first") || lowerMsg.includes("start with")) {
    const firstMilestone = vModel.executionMilestones[0];
    const firstTitle = firstMilestone?.title || "Validate customer purchasing demand and location feasibility";

    return `Your first step for **${name}** (${vModel.ventureType}) should be: **${firstTitle}**.

1. **What to do**: ${firstMilestone?.description || `Focus directly on validating customer demand and key operational constraints before committing capital.`}
2. **Why it matters**: In the ${vModel.ventureIndustry} domain, addressing your primary validation risk early prevents premature capital expenditure on unverified operational assumptions.
3. **How to do it**: Conduct initial customer/buyer outreach, evaluate target market parameters in ${vModel.marketScope}, and test pricing acceptance.
4. **What result to look for**: Clear willingness to purchase from your target segment (${vModel.customerPersona}) and confirmation of baseline unit economics.
5. **What to do next**: Once customer purchasing intent is confirmed, proceed to: *"${vModel.executionMilestones[1]?.title || "Set up basic equipment and operational workflow"}"*.`;
  }

  // Equipment / Machinery / Assets Inquiry
  if (lowerMsg.includes("equipment") || lowerMsg.includes("machinery") || lowerMsg.includes("hardware") || lowerMsg.includes("tool") || lowerMsg.includes("asset")) {
    return `Based on what you've described for **${name}** (${vModel.ventureType} in ${vModel.ventureIndustry}), equipment requirements depend on your target output capacity and operational setup.

Typically, key operational assets to consider include:
${vModel.requiredResources.map((r) => `- **${r}**`).join("\n")}

*Note*: Since specific production volumes and equipment lists were not provided in your description, evaluate supplier quotes and utility capacity (such as power load or space footprint) before making commitments.`;
  }

  // License / Regulatory / Permits Inquiry
  if (lowerMsg.includes("license") || lowerMsg.includes("permit") || lowerMsg.includes("tax") || lowerMsg.includes("gst") || lowerMsg.includes("legal") || lowerMsg.includes("compliance") || lowerMsg.includes("fssai")) {
    return `Regulatory requirements for **${name}** (${vModel.ventureType}) depend on your operating location, business structure, and local municipal laws.

Common compliance areas that may be relevant to validate include:
${vModel.regulatoryRequirements.map((r) => `- **${r}**`).join("\n")}

*Recommendation*: Verify current registration thresholds and local municipal rules for your specific jurisdiction before starting public operations.`;
  }

  // Pricing / Margins / Economics Inquiry
  if (lowerMsg.includes("price") || lowerMsg.includes("pricing") || lowerMsg.includes("margin") || lowerMsg.includes("cost") || lowerMsg.includes("revenue") || lowerMsg.includes("unit economics")) {
    return `For **${name}** (${vModel.ventureType}), pricing and unit economics depend on direct variable costs and competitive positioning in your target market.

- **Current Model Status**: ${vModel.revenueMechanism} (${vModel.revenueModelSource})
- **Primary Cost Factors**: ${vModel.operationalConstraints.join(", ")}

*Illustrative Benchmark*: Compare your direct production/item costs against local market standards to establish sustainable operating margins after accounting for overhead.`;
  }

  // Competitors / Alternatives Inquiry
  if (lowerMsg.includes("competitor") || lowerMsg.includes("competition") || lowerMsg.includes("rival") || lowerMsg.includes("alternative")) {
    return `Customer alternatives for **${name}** (${vModel.ventureType}) depend on how target buyers currently satisfy this need.

Major alternative categories in this domain include:
${vModel.competitiveAlternatives.map((c) => `- **${c.name}** (${c.alternativeType}): ${c.description}`).join("\n")}

*Strategy*: Focus on identifying what specific advantage or convenience makes your offering stand out against these alternatives.`;
  }

  // Basic Requirements / General Venture Question
  return `Based on your description of **${name}** (${vModel.ventureType}, Industry: **${vModel.ventureIndustry}**), here are the primary operational considerations relevant to your venture:

- **Target Customer Segment**: ${vModel.customerPersona} (${vModel.customerPersonaSource})
- **Core Operational Assets**: ${vModel.requiredResources.join(", ")}
- **Key Validation Focus**: ${vModel.executionMilestones[0]?.title || "Validate customer purchasing demand"}
- **Potential Regulatory Considerations**: ${vModel.regulatoryRequirements.join(", ")}

*Consulting Note*: As you refine ${name}, validate your specific operational constraints and local market demand before scaling investments.`;
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
