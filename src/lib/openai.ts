import OpenAI from "openai";
import {
  AnalysisResultJSON,
  BusinessClassification,
  BusinessDNA,
  StartupLifecycle,
  LifecycleStage,
  IdeaTypeKind,
  IndustryProfile,
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

const DOMAIN_REFUSAL_MESSAGE = `I'm designed specifically to help with startups and business ventures.

I can't provide reliable answers outside that domain.

Ask me anything about:

• Business validation & market demand
• Operations, licensing & location selection
• Revenue models & unit economics
• Execution roadmap & competitor analysis
• Growth strategy & expansion`;

export type DetailedStartupCategory =
  | "FOOD"
  | "FASHION"
  | "FITNESS"
  | "HEALTHCARE"
  | "EDUCATION"
  | "MANUFACTURING"
  | "AGRICULTURE"
  | "RETAIL_LOCAL"
  | "SOFTWARE_SAAS";

export interface IndustryExpertPersona {
  category: DetailedStartupCategory;
  personaTitle: string;
  ideaTypeKind: IdeaTypeKind;
  primaryDomainFocus: string[];
  forbiddenTerms: string[];
}

export interface ClarificationCheckResult {
  needsClarification: boolean;
  questions?: string[];
  message?: string;
}

export function detectIdeaTypeKind(text: string, category: DetailedStartupCategory): IdeaTypeKind {
  const lower = text.toLowerCase();
  if (lower.includes("software") || lower.includes("saas") || lower.includes("app") || category === "SOFTWARE_SAAS") {
    return "Technology Startup";
  }
  if (category === "FOOD" || category === "FITNESS" || category === "RETAIL_LOCAL") {
    return "Local Business";
  }
  if (category === "FASHION" || category === "AGRICULTURE") {
    return "Product Business";
  }
  if (category === "MANUFACTURING" || category === "HEALTHCARE") {
    return "Traditional Business";
  }
  return "Traditional Business";
}

export function inferIndustryProfile(input: StartupIdeaInput): IndustryProfile {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution} ${input.businessModel}`.toLowerCase();
  const category = detectDetailedStartupCategory(fullText);

  let detectedIndustry = "Technology & Software";
  let subIndustry = "B2B SaaS / Web App";
  let categoryKind: IndustryProfile["businessCategoryKind"] = "Technology Startup";
  let regulatoryBody = "Standard Corporate Regulations";
  let metrics = ["Monthly Recurring Revenue (MRR)", "Customer Acquisition Cost (CAC)", "User Activation Rate"];

  if (category === "FOOD") {
    detectedIndustry = "Food & Beverage";
    subIndustry = fullText.includes("panipuri") ? "Street Food / Quick Service Counter" : "Restaurant & Food Service";
    categoryKind = fullText.includes("panipuri") ? "Local Business" : "Offline Business";
    regulatoryBody = "FSSAI Food Safety & Municipal Trade Licensing";
    metrics = ["Daily Counter Footfall", "Average Transaction Value", "Gross Ingredient Profit Margin (65%+)"];
  } else if (category === "FASHION") {
    detectedIndustry = "Fashion & Apparel";
    subIndustry = "D2C Apparel & Clothing Brand";
    categoryKind = "Product Business";
    regulatoryBody = "GST & Textile Standards Authority";
    metrics = ["Fabric Sample Testing Pass Rate", "Return Rate (<10%)", "Gross Merchandise Value (GMV)"];
  } else if (category === "FITNESS") {
    detectedIndustry = "Fitness & Wellness";
    subIndustry = "Health Club & Commercial Gym";
    categoryKind = "Local Business";
    regulatoryBody = "Municipal Trade Permit & Commercial Fire Clearance";
    metrics = ["Active Monthly Subscriptions", "Personal Training Upsell Rate", "Floor Capacity Utilization"];
  } else if (category === "HEALTHCARE") {
    detectedIndustry = "Healthcare & Medical Services";
    subIndustry = "Clinical Care & Hospital";
    categoryKind = "Offline Business";
    regulatoryBody = "Medical Council & Clinical Establishment Authority";
    metrics = ["Bed Occupancy Rate", "Patient Satisfaction & Referral Score", "Diagnostic Precision Rate"];
  } else if (category === "MANUFACTURING") {
    detectedIndustry = "Manufacturing & Processing";
    subIndustry = "Agri-Processing & Industrial Milling";
    categoryKind = "Manufacturing";
    regulatoryBody = "Pollution Control Board & Industrial Factory License";
    metrics = ["Milling Machinery Yield %", "Daily Processing Tonnage", "Raw Material Paddy Procurement Cost"];
  } else if (category === "AGRICULTURE") {
    detectedIndustry = "Agriculture & Agribusiness";
    subIndustry = "Organic Farming & Crop Production";
    categoryKind = "Product Business";
    regulatoryBody = "Organic Certification Authority (NPOP/APMC)";
    metrics = ["Crop Yield Per Acre", "Cold Storage Preservation Rate", "Wholesale Mandi Off-Take Price"];
  } else if (category === "EDUCATION") {
    detectedIndustry = "Education & Training";
    subIndustry = "Academy & Coaching Center";
    categoryKind = "Service Business";
    regulatoryBody = "Education Department & Academic Accreditation";
    metrics = ["Student Batch Enrollment Rate", "Exam Pass Ratio", "Teacher Retention Rate"];
  } else if (category === "RETAIL_LOCAL") {
    detectedIndustry = "Retail & Commerce";
    subIndustry = "Storefront Retail & Goods Shop";
    categoryKind = "Local Business";
    regulatoryBody = "Shops & Establishment Licensing";
    metrics = ["Sales Per Square Foot", "Inventory Turnover Ratio", "Repeat Shopper Rate"];
  }

  return {
    detectedIndustry,
    subIndustry,
    businessCategoryKind: categoryKind,
    revenueModelType: input.businessModel || "Direct Commercial Sales",
    regulatoryBody,
    keyOperatingMetrics: metrics,
  };
}

export function assessClarificationNeed(input: StartupIdeaInput): ClarificationCheckResult {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution}`.trim();
  const name = input.startupName.trim();
  const idea = input.idea.trim();

  // If startup concept contains explicit domain markers, proceed directly
  const clearSelfContainedTerms = [
    "panipuri", "puri", "chaat", "restaurant", "food", "clothing", "fashion", "apparel",
    "gym", "fitness", "tuition", "school", "academy", "hospital", "clinic",
    "rice mill", "mill", "factory", "bakery", "salon", "laundry", "resume builder",
    "delivery", "saas", "software", "marketplace", "e-commerce", "organic farming", "farming"
  ];

  const lower = fullText.toLowerCase();
  const isSelfContained = clearSelfContainedTerms.some((term) => lower.includes(term));

  if (isSelfContained && idea.length >= 6) {
    return { needsClarification: false };
  }

  // Check for ambiguous single-word/short inputs like "FreshBox", "SmartCart", "NextGen"
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 15 || idea.length < 15 || (!isSelfContained && idea.split(" ").length < 4)) {
    const isSmartCart = name.toLowerCase().includes("smartcart");
    const isFreshBox = name.toLowerCase().includes("freshbox");

    let specificQuestions: string[] = [];

    if (isFreshBox) {
      specificQuestions = [
        "What does FreshBox do in detail?",
        "Is it a software product, a food/meal delivery business, an e-commerce platform, or a logistics company?",
        "Who are your primary target customers?",
      ];
    } else if (isSmartCart) {
      specificQuestions = [
        "What does SmartCart do in detail?",
        "Is it grocery delivery, POS checkout software, an e-commerce platform, or an AI shopping assistant?",
        "Who are your primary target customers?",
      ];
    } else {
      specificQuestions = [
        `What does ${name} do in detail?`,
        `Is ${name} a software/SaaS product, a food/retail business, an e-commerce platform, or a local service?`,
        `Who are your primary target customers and geography?`,
      ];
    }

    return {
      needsClarification: true,
      questions: specificQuestions,
      message: `Before I analyze your startup, I need a little more information.`,
    };
  }

  return { needsClarification: false };
}

export function detectDetailedStartupCategory(text: string): DetailedStartupCategory {
  const lower = text.toLowerCase();

  // Explicit check for software tools (e.g. Hospital Management Software)
  if (lower.includes("software") || lower.includes("saas") || lower.includes("platform app") || lower.includes("resume builder")) {
    return "SOFTWARE_SAAS";
  }

  // 1. Food & Beverage (Panipuri, Bakery, Restaurant, Cafe)
  if (
    lower.includes("panipuri") ||
    lower.includes("puri") ||
    lower.includes("chaat") ||
    lower.includes("restaurant") ||
    lower.includes("food") ||
    lower.includes("cafe") ||
    lower.includes("kitchen") ||
    lower.includes("bakery") ||
    lower.includes("catering") ||
    lower.includes("snack") ||
    lower.includes("dhaba") ||
    lower.includes("dining") ||
    lower.includes("biryani") ||
    lower.includes("beverage")
  ) {
    return "FOOD";
  }

  // 2. Fashion & Apparel
  if (
    lower.includes("clothing") ||
    lower.includes("fashion") ||
    lower.includes("apparel") ||
    lower.includes("garment") ||
    lower.includes("textile") ||
    lower.includes("shoe") ||
    lower.includes("wear") ||
    lower.includes("boutique") ||
    lower.includes("jewelry")
  ) {
    return "FASHION";
  }

  // 3. Fitness & Gym
  if (
    lower.includes("gym") ||
    lower.includes("fitness") ||
    lower.includes("workout") ||
    lower.includes("yoga") ||
    lower.includes("trainer") ||
    lower.includes("crossfit") ||
    lower.includes("wellness center")
  ) {
    return "FITNESS";
  }

  // 4. Healthcare & Hospital
  if (
    lower.includes("hospital") ||
    lower.includes("healthcare") ||
    lower.includes("clinic") ||
    lower.includes("doctor") ||
    lower.includes("medical") ||
    lower.includes("patient") ||
    lower.includes("nursing") ||
    lower.includes("pharma")
  ) {
    return "HEALTHCARE";
  }

  // 5. Manufacturing & Processing (e.g. Rice Mill, Factory)
  if (
    lower.includes("rice mill") ||
    lower.includes("mill") ||
    lower.includes("factory") ||
    lower.includes("plant") ||
    lower.includes("manufactur") ||
    lower.includes("assembly") ||
    lower.includes("industrial") ||
    lower.includes("processing unit")
  ) {
    return "MANUFACTURING";
  }

  // 6. Agriculture & Farming (e.g. Organic Farming)
  if (
    lower.includes("farm") ||
    lower.includes("crop") ||
    lower.includes("agri") ||
    lower.includes("organic harvest") ||
    lower.includes("fertilizer") ||
    lower.includes("organic farming")
  ) {
    return "AGRICULTURE";
  }

  // 7. Education & Academy
  if (
    lower.includes("school") ||
    lower.includes("coaching") ||
    lower.includes("tuition") ||
    lower.includes("academy") ||
    lower.includes("institute") ||
    lower.includes("tutor") ||
    lower.includes("education")
  ) {
    return "EDUCATION";
  }

  // 8. Retail & Local Shop
  if (
    lower.includes("shop") ||
    lower.includes("store") ||
    lower.includes("retail") ||
    lower.includes("supermarket") ||
    lower.includes("grocery") ||
    lower.includes("salon") ||
    lower.includes("laundry")
  ) {
    return "RETAIL_LOCAL";
  }

  // 9. Software / SaaS
  return "SOFTWARE_SAAS";
}

export const detectStartupCategory = detectDetailedStartupCategory;

export function getExpertPersona(category: DetailedStartupCategory): IndustryExpertPersona {
  switch (category) {
    case "FOOD":
      return {
        category: "FOOD",
        personaTitle: "Restaurant & Food Business Consultant",
        ideaTypeKind: "Local Business",
        primaryDomainFocus: [
          "Location selection & footfall analysis",
          "Hygiene, taste & recipe standardization",
          "FSSAI food licensing & municipal permits",
          "Ingredient sourcing & gross margins (65%+)",
          "Delivery platform partnerships (Zomato/Swiggy)",
        ],
        forbiddenTerms: ["MVP", "writing code", "APIs", "tech stack", "software engineering", "CAC", "LTV", "churn"],
      };
    case "FASHION":
      return {
        category: "FASHION",
        personaTitle: "Fashion & Retail Business Consultant",
        ideaTypeKind: "Product Business",
        primaryDomainFocus: [
          "Brand positioning & target demographic",
          "Fabric quality, stitching & sample testing",
          "D2C e-commerce & social media drops",
          "Influencer seeding & return rate management",
          "Wholesale & retail store distribution",
        ],
        forbiddenTerms: ["MVP", "writing code", "APIs", "software engineering"],
      };
    case "FITNESS":
      return {
        category: "FITNESS",
        personaTitle: "Fitness & Wellness Business Consultant",
        ideaTypeKind: "Local Business",
        primaryDomainFocus: [
          "High-density commercial location",
          "Gym equipment leasing & setup",
          "Trainer recruitment & certification",
          "Monthly subscription memberships",
          "Peak-hour floor capacity & hygiene",
        ],
        forbiddenTerms: ["writing code", "APIs", "software engineering"],
      };
    case "HEALTHCARE":
      return {
        category: "HEALTHCARE",
        personaTitle: "Healthcare Business Consultant",
        ideaTypeKind: "Traditional Business",
        primaryDomainFocus: [
          "Medical licensing & regulatory compliance",
          "Doctor & clinical staff recruitment",
          "Patient trust & diagnostic accuracy",
          "Emergency facilities & ICU equipment",
          "Hospital partnerships & health insurance billing",
        ],
        forbiddenTerms: ["writing code", "APIs", "SaaS metrics"],
      };
    case "MANUFACTURING":
      return {
        category: "MANUFACTURING",
        personaTitle: "Manufacturing Consultant",
        ideaTypeKind: "Traditional Business",
        primaryDomainFocus: [
          "Factory location & land zoning",
          "Milling machinery & processing equipment",
          "Raw material bulk procurement (e.g. paddy/iron)",
          "Quality control & yield percentage",
          "B2B wholesale distributor channels",
        ],
        forbiddenTerms: ["writing code", "APIs", "MVP app"],
      };
    case "AGRICULTURE":
      return {
        category: "AGRICULTURE",
        personaTitle: "Agribusiness Consultant",
        ideaTypeKind: "Product Business",
        primaryDomainFocus: [
          "Soil testing & organic crop yield optimization",
          "Cold storage & post-harvest preservation",
          "Mandi distribution & APMC wholesaler networks",
          "Organic certification & export compliance",
        ],
        forbiddenTerms: ["writing code", "APIs", "software engineering"],
      };
    case "EDUCATION":
      return {
        category: "EDUCATION",
        personaTitle: "Education Consultant",
        ideaTypeKind: "Service Business",
        primaryDomainFocus: [
          "Curriculum design & learning outcomes",
          "Teacher recruitment & pedagogical quality",
          "Student enrollment & batch pricing",
          "Parent trust & exam pass ratios",
        ],
        forbiddenTerms: ["writing code", "APIs"],
      };
    default:
      return {
        category: "SOFTWARE_SAAS",
        personaTitle: "Startup & SaaS Consultant",
        ideaTypeKind: "Technology Startup",
        primaryDomainFocus: [
          "MVP development & core feature set",
          "Product validation & user onboarding (< 60s)",
          "Scalable cloud infrastructure & APIs",
          "CAC, LTV, churn & retention metrics",
          "Tiered SaaS subscription pricing",
        ],
        forbiddenTerms: [],
      };
  }
}

export function inferStartupLifecycle(input: StartupIdeaInput): StartupLifecycle {
  const text = `${input.startupName} ${input.idea} ${input.problem} ${input.solution} ${input.businessModel}`.toLowerCase();

  let stage: LifecycleStage = "Validation Stage";
  let confidence = 91;
  let reason = "Startup has a formulated concept and target demographic, but requires formal customer demand validation.";

  if (text.includes("revenue") || text.includes("paying") || text.includes("sales") || text.includes("profit")) {
    stage = "Early Revenue Stage";
    confidence = 93;
    reason = "Startup has generated initial paying customer transactions and repeatable sales.";
  } else if (text.includes("launched") || text.includes("live") || text.includes("operating")) {
    stage = "Launch Stage";
    confidence = 90;
    reason = "Product/service is active in market seeking initial user adoption.";
  } else if (text.includes("building") || text.includes("prototype") || text.includes("setup")) {
    stage = "MVP Stage";
    confidence = 88;
    reason = "Startup is actively constructing its first functional MVP/storefront prototype.";
  } else if (text.includes("concept") || text.includes("thinking") || text.includes("idea only")) {
    stage = "Idea Stage";
    confidence = 94;
    reason = "Startup exists as an unvalidated conceptual idea.";
  }

  return {
    currentStage: stage,
    confidenceScore: confidence,
    reason,
    nextMilestone:
      stage === "Idea Stage"
        ? "Conduct 15 customer discovery interviews"
        : stage === "Validation Stage"
        ? "Build lightweight prototype / sample counter setup"
        : stage === "MVP Stage"
        ? "Onboard first 10 beta test users / soft launch outlet"
        : "Scale paying customer acquisition",
    estimatedTimeToNextStage: "3-6 weeks",
    keyObjectives: [
      "Validate problem urgency with target customers",
      "Confirm willingness-to-pay for core business model",
      "Establish primary customer acquisition channel",
    ],
    currentStageRisks: [
      "Premature scaling before verifying customer demand",
      "Miscalculating initial unit economics and operating costs",
    ],
    successProbability: Math.min(88, Math.max(62, Math.round(confidence * 0.85))),
    potentialBlockers: [
      "Customer discovery interview drop-offs",
      "Licensing and regulatory approval delays",
    ],
    suggestedPriorities: [
      "Complete problem discovery calls",
      "Lock in initial pricing model",
      "Build basic brand awareness",
    ],
  };
}

export function inferBusinessDNA(input: StartupIdeaInput): BusinessDNA {
  const name = input.startupName.trim();
  const fullText = `${name} ${input.idea} ${input.problem} ${input.solution} ${input.businessModel}`.toLowerCase();
  const category = detectDetailedStartupCategory(fullText);
  const ideaTypeKind = detectIdeaTypeKind(fullText, category);

  if (category === "FOOD") {
    const isPuri = fullText.includes("panipuri") || fullText.includes("chaat");
    const isBakery = fullText.includes("bakery") || fullText.includes("cake");
    return {
      startupName: name,
      industry: "Food & Beverage",
      subIndustry: isPuri ? "Quick Service Street Food" : isBakery ? "Artisanal Bakery & Confectionery" : "Restaurant & Food Service",
      businessCategory: isPuri ? "Street Food Outlet" : isBakery ? "Bakery Shop" : "Quick Service Restaurant",
      ideaTypeKind,
      businessType: "Offline Local Business",
      businessModel: input.businessModel || "Direct Counter Sales & Food App Commissions",
      revenueModel: "Direct Retail Cash & Digital Payments",
      businessStage: "Idea",
      targetCustomers: input.audience || "Students, Office Workers & Local Families",
      customerPersona: "Budget-conscious food lovers seeking quick, hygienic, and authentic snacks",
      marketScope: "Local",
      investmentLevel: "Low",
      operationalComplexity: "Medium",
      technologyDependency: "Low",
      scalability: "Medium",
      expansionPotential: "Multi-outlet Franchising & Dark Kitchen Delivery Units",
      fundingRequirement: "$3,000 - $10,000",
      fundingType: "Self-funded / Bootstrapped",
      competitionLevel: "High",
      riskLevel: "Medium",
      growthPotential: "High",
      digitalPresenceImportance: "Medium",
      requiredLicenses: ["FSSAI Food Safety License", "GST Registration", "Municipal Trade Permit"],
      primarySuccessFactors: [
        "High Footfall Storefront Location",
        "Strict Taste & Recipe Consistency",
        "Hygienic Presentation & Cleanliness",
        "Fast Counter Customer Service",
      ],
      biggestChallenges: [
        "Perishable raw ingredient management",
        "Local street vendor competition",
        "Shift staff training and retention",
      ],
      keyAdvantages: [
        "Low initial capital expenditure (CapEx)",
        "High 65%+ gross profit margins",
        "Daily positive cash flow cycle",
      ],
      uniqueSellingProposition: isPuri
        ? "Hygienic panipuri served with mineral water and 6 custom flavored waters"
        : "Fresh, high-quality food prepared with standardized secret family recipes",
      estimatedTimeToLaunch: "2-4 weeks",
      estimatedInitialInvestment: "$3,000 - $8,000",
      recommendedTeamSize: "2-4 staff",
      businessPriority: "Location Selection, FSSAI Licensing & Taste Standardization",
    };
  }

  if (category === "AGRICULTURE") {
    return {
      startupName: name,
      industry: "Agriculture & Agribusiness",
      subIndustry: "Organic Farming & Produce",
      businessCategory: "Organic Farm",
      ideaTypeKind,
      businessType: "Physical Goods / D2C",
      businessModel: input.businessModel || "Direct Wholesale & Mandi Distribution",
      revenueModel: "Wholesale Harvest Sales & Direct Farm Subscription Boxes",
      businessStage: "Idea",
      targetCustomers: input.audience || "Wholesale Mandi Traders, Supermarkets & Organic Retailers",
      customerPersona: "Quality-conscious produce buyers seeking pesticide-free certified organic crops",
      marketScope: "Regional",
      investmentLevel: "Medium",
      operationalComplexity: "Medium",
      technologyDependency: "Low",
      scalability: "High",
      expansionPotential: "Regional Organic Brand & D2C Farm Box Subscription Network",
      fundingRequirement: "$15,000 - $60,000",
      fundingType: "Agri-Loan / Self-funded",
      competitionLevel: "Medium",
      riskLevel: "Medium",
      growthPotential: "High",
      digitalPresenceImportance: "Low",
      requiredLicenses: ["Organic Certification (NPOP/PGS)", "GST", "APMC Trade Permit"],
      primarySuccessFactors: [
        "Soil Fertility & Drip Irrigation Setup",
        "Pesticide-free Crop Quality Control",
        "Cold Storage & Post-Harvest Transit",
        "Direct Wholesale Off-take Contracts",
      ],
      biggestChallenges: [
        "Weather dependency & monsoon risks",
        "Perishable crop spoilage in transit",
        "Price fluctuations in wholesale markets",
      ],
      keyAdvantages: [
        "High premium pricing for certified organic produce",
        "Government agricultural subsidies & tax exemptions",
      ],
      uniqueSellingProposition: "100% certified organic produce harvested fresh and shipped within 24 hours",
      estimatedTimeToLaunch: "3-6 months",
      estimatedInitialInvestment: "$10,000 - $30,000",
      recommendedTeamSize: "3-6 farm technicians & operators",
      businessPriority: "Soil Preparation, Irrigation Installation & Organic Certification",
    };
  }

  if (category === "FASHION") {
    return {
      startupName: name,
      industry: "Fashion & Apparel",
      subIndustry: "D2C Apparel & Garments",
      businessCategory: "D2C Clothing Brand",
      ideaTypeKind,
      businessType: "Physical Goods / D2C",
      businessModel: input.businessModel || "Direct-to-Consumer E-Commerce",
      revenueModel: "Direct Online Sales & Wholesale Tiering",
      businessStage: "Idea",
      targetCustomers: input.audience || "Fashion Conscious Youth & Young Adults",
      customerPersona: "Trend-driven shoppers seeking premium fabric quality and unique design aesthetics",
      marketScope: "National",
      investmentLevel: "Medium",
      operationalComplexity: "Medium",
      technologyDependency: "Medium",
      scalability: "High",
      expansionPotential: "Global E-Commerce & Retail Multi-brand Store Placements",
      fundingRequirement: "$15,000 - $50,000",
      fundingType: "Self-funded / Bootstrapped",
      competitionLevel: "High",
      riskLevel: "Medium",
      growthPotential: "High",
      digitalPresenceImportance: "High",
      requiredLicenses: ["GST Registration", "Import-Export Code (IEC)", "Trademark Registration"],
      primarySuccessFactors: [
        "Fabric Quality & Stitching Precision",
        "Instagram & TikTok Viral Short-Form Content",
        "Low Customer Return Rate (<10%)",
        "Influencer Product Seeding",
      ],
      biggestChallenges: [
        "Inventory overstock and deadstock risk",
        "E-commerce return logistics costs",
        "High Facebook/Instagram ad acquisition costs",
      ],
      keyAdvantages: [
        "Scalable national shipping reach",
        "High brand equity leverage",
        "70%+ D2C gross product margins",
      ],
      uniqueSellingProposition: "Premium fabric craftsmanship combined with modern street fashion designs",
      estimatedTimeToLaunch: "4-8 weeks",
      estimatedInitialInvestment: "$10,000 - $25,000",
      recommendedTeamSize: "3-5 team members",
      businessPriority: "Fabric Sourcing, Sample Batch Testing & Social Media Launch",
    };
  }

  if (category === "FITNESS") {
    return {
      startupName: name,
      industry: "Fitness & Wellness",
      subIndustry: "Gym & Health Club",
      businessCategory: "Fitness Center",
      ideaTypeKind,
      businessType: "Offline Local Business",
      businessModel: input.businessModel || "Monthly & Annual Gym Memberships",
      revenueModel: "Recurring Subscriptions & Personal Training Fees",
      businessStage: "Idea",
      targetCustomers: input.audience || "Local Residents, Working Professionals & Fitness Enthusiasts",
      customerPersona: "Individuals seeking health transformation, modern strength equipment, and certified trainers",
      marketScope: "Local",
      investmentLevel: "High",
      operationalComplexity: "Medium",
      technologyDependency: "Low",
      scalability: "Medium",
      expansionPotential: "City-wide Gym Chain Franchising",
      fundingRequirement: "$40,000 - $120,000",
      fundingType: "Bank Loan",
      competitionLevel: "Medium",
      riskLevel: "Medium",
      growthPotential: "High",
      digitalPresenceImportance: "Medium",
      requiredLicenses: ["Commercial Trade Permit", "Music Rights License", "Fire Safety Clearance"],
      primarySuccessFactors: [
        "High-density residential location",
        "Modern commercial workout machinery",
        "Certified, motivating trainers",
        "Spotless floor hygiene & air conditioning",
      ],
      biggestChallenges: [
        "High initial equipment lease CapEx",
        "Member churn after 3-6 months",
        "Trainer turnover rates",
      ],
      keyAdvantages: [
        "Predictable recurring membership revenue",
        "High personal training upsell margins",
      ],
      uniqueSellingProposition: "State-of-the-art biomechanical gym equipment with personalized transformation coaching",
      estimatedTimeToLaunch: "6-12 weeks",
      estimatedInitialInvestment: "$40,000 - $80,000",
      recommendedTeamSize: "4-8 trainers & front desk staff",
      businessPriority: "Location Lease Locking, Equipment Sourcing & Pre-launch Member Signups",
    };
  }

  if (category === "HEALTHCARE") {
    return {
      startupName: name,
      industry: "Healthcare & Medical Services",
      subIndustry: "Clinical Care & Hospital",
      businessCategory: "Hospital / Specialty Clinic",
      ideaTypeKind,
      businessType: "Offline Local Business",
      businessModel: input.businessModel || "Patient Fee-for-Service & Diagnostic Billing",
      revenueModel: "Patient Fee-for-Service & Health Insurance Claims",
      businessStage: "Idea",
      targetCustomers: input.audience || "Patients, Families & Local Community",
      customerPersona: "Patients seeking reliable diagnostic care, experienced doctors, and modern clinical facilities",
      marketScope: "Regional",
      investmentLevel: "High",
      operationalComplexity: "High",
      technologyDependency: "Medium",
      scalability: "Medium",
      expansionPotential: "Regional Multi-specialty Hospital Network",
      fundingRequirement: "$100,000 - $500,000",
      fundingType: "Bank Loan / Healthcare VC",
      competitionLevel: "Medium",
      riskLevel: "High",
      growthPotential: "High",
      digitalPresenceImportance: "Medium",
      requiredLicenses: ["Medical Council Registration", "Clinical Establishment Act Permit", "Biomedical Waste Disposal Clearance"],
      primarySuccessFactors: [
        "Renowned Doctor & Specialist Reputation",
        "24/7 ICU & Emergency Readiness",
        "Strict Hygiene & Diagnostic Accuracy",
        "Health Insurance Empanelment",
      ],
      biggestChallenges: [
        "Complex medical regulatory compliance",
        "High medical equipment maintenance costs",
        "Doctor recruitment and retention",
      ],
      keyAdvantages: [
        "Inelastic, non-cyclical healthcare demand",
        "High patient trust & referral retention",
      ],
      uniqueSellingProposition: "Compassionate, high-precision clinical care backed by senior specialists",
      estimatedTimeToLaunch: "3-6 months",
      estimatedInitialInvestment: "$100,000 - $300,000",
      recommendedTeamSize: "10-25 medical staff & doctors",
      businessPriority: "Regulatory Licensing, Specialist Empanelment & Diagnostic Setup",
    };
  }

  if (category === "MANUFACTURING") {
    return {
      startupName: name,
      industry: "Manufacturing & Industrial Operations",
      subIndustry: "Agri-Processing & Milling",
      businessCategory: "Processing Plant / Rice Mill",
      ideaTypeKind,
      businessType: "Physical Goods / D2C",
      businessModel: input.businessModel || "B2B Wholesale Bulk Sales",
      revenueModel: "Bulk Wholesale Grain Trading & Custom Processing Fees",
      businessStage: "Idea",
      targetCustomers: input.audience || "Wholesale Grain Traders, Supermarket Chains & Exporters",
      customerPersona: "Bulk commodity buyers seeking consistent grain quality, low moisture, and reliable delivery volumes",
      marketScope: "Regional",
      investmentLevel: "High",
      operationalComplexity: "High",
      technologyDependency: "Low",
      scalability: "Medium",
      expansionPotential: "National Commodity Brand Distribution & Export Channels",
      fundingRequirement: "$80,000 - $350,000",
      fundingType: "Bank Equipment Loan / Industrial Capital",
      competitionLevel: "Medium",
      riskLevel: "Medium",
      growthPotential: "High",
      digitalPresenceImportance: "Low",
      requiredLicenses: ["Factory Operating License", "Pollution Control Board Clearance", "FSSAI Bulk Grain License", "GST"],
      primarySuccessFactors: [
        "Raw Paddy Procurement Sourcing",
        "Modern Milling Machinery Yield Efficiency",
        "Strict Moisture & Grain Sorting Controls",
        "Reliable B2B Wholesale Trader Network",
      ],
      biggestChallenges: [
        "Seasonal raw paddy price fluctuations",
        "High industrial electricity & machinery power costs",
        "Bulk inventory storage & pest control",
      ],
      keyAdvantages: [
        "High volume daily processing turnover",
        "Value-add byproduct monetization (husk/bran)",
      ],
      uniqueSellingProposition: "Premium grade rice processing with zero grain breakage and high head-rice yield",
      estimatedTimeToLaunch: "2-4 months",
      estimatedInitialInvestment: "$70,000 - $200,000",
      recommendedTeamSize: "8-15 factory technicians & operators",
      businessPriority: "Factory Land Procurement, Milling Machinery Installation & Paddy Supplier Contracts",
    };
  }

  return {
    startupName: name,
    industry: "AI SaaS & Software",
    subIndustry: "B2B Venture Software",
    businessCategory: "B2B SaaS Platform",
    ideaTypeKind: "Technology Startup",
    businessType: "Digital / Software / SaaS",
    businessModel: input.businessModel || "Tiered Monthly Subscription",
    revenueModel: "Recurring SaaS Subscriptions",
    businessStage: "Idea",
    targetCustomers: input.audience || "Digital Founders & Enterprise Product Teams",
    customerPersona: "Tech-savvy founders looking to automate manual business workflows",
    marketScope: "Global",
    investmentLevel: "Low",
    operationalComplexity: "Low",
    technologyDependency: "High",
    scalability: "High",
    expansionPotential: "Global SaaS Distribution & API Integration Partnerships",
    fundingRequirement: "$20,000 - $100,000",
    fundingType: "Self-funded / Angel VC",
    competitionLevel: "Medium",
    riskLevel: "Low",
    growthPotential: "Exponential",
    digitalPresenceImportance: "High",
    requiredLicenses: ["Company Incorporation", "Terms of Service & Privacy Compliance"],
    primarySuccessFactors: [
      "Frictionless Onboarding (< 60s)",
      "High Product Value & Churn Reduction",
      "Organic SEO & Outbound Pipeline",
      "Scalable Cloud Infrastructure",
    ],
    biggestChallenges: [
      "Customer acquisition cost (CAC) optimization",
      "Feature copying by incumbent platforms",
      "User activation rate bottlenecks",
    ],
    keyAdvantages: [
      "Zero physical inventory & marginal distribution cost",
      "85%+ Software gross margins",
      "Global day-one customer reach",
    ],
    uniqueSellingProposition: "Instant AI automated workflow execution with zero setup friction",
    estimatedTimeToLaunch: "3-6 weeks",
    estimatedInitialInvestment: "$5,000 - $15,000",
    recommendedTeamSize: "2-4 engineers & founders",
    businessPriority: "Customer Discovery Interviews, MVP Prototype & Landing Page Smoke Test",
  };
}

export function inferBusinessClassification(input: StartupIdeaInput): BusinessClassification {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution} ${input.businessModel}`.toLowerCase();
  const category = detectDetailedStartupCategory(fullText);
  const ideaTypeKind = detectIdeaTypeKind(fullText, category);

  if (category === "FOOD") {
    return {
      industry: "Food & Beverage",
      businessCategory: fullText.includes("panipuri") || fullText.includes("chaat") ? "Street Food Business" : fullText.includes("bakery") ? "Bakery Business" : "Food & Restaurant Business",
      ideaTypeKind,
      businessType: "Offline Local Business",
      revenueModel: input.businessModel || "Direct Counter Sales",
      scalability: "Medium",
      businessStage: "Idea",
      primaryCustomerSegment: input.audience || "Local Residents, Students & Office Employees",
      marketScope: "Local",
      digitalDependency: "Low",
    };
  }

  if (category === "AGRICULTURE") {
    return {
      industry: "Agriculture & Agribusiness",
      businessCategory: "Organic Farm",
      ideaTypeKind,
      businessType: "Physical Goods / D2C",
      revenueModel: input.businessModel || "Wholesale Mandi Sales",
      scalability: "High",
      businessStage: "Idea",
      primaryCustomerSegment: input.audience || "Wholesale Grain Traders & Supermarkets",
      marketScope: "Regional",
      digitalDependency: "Low",
    };
  }

  if (category === "FASHION") {
    return {
      industry: "Fashion & Apparel",
      businessCategory: "D2C Clothing Brand",
      ideaTypeKind,
      businessType: "Physical Goods / D2C",
      revenueModel: input.businessModel || "Direct-to-Consumer E-Commerce",
      scalability: "High",
      businessStage: "Idea",
      primaryCustomerSegment: input.audience || "Fashion Conscious Youth & Adults",
      marketScope: "National",
      digitalDependency: "Medium",
    };
  }

  if (category === "FITNESS") {
    return {
      industry: "Fitness & Wellness",
      businessCategory: "Gym & Fitness Club",
      ideaTypeKind,
      businessType: "Offline Local Business",
      revenueModel: input.businessModel || "Monthly Membership Subscriptions",
      scalability: "Medium",
      businessStage: "Idea",
      primaryCustomerSegment: input.audience || "Local Residents & Working Professionals",
      marketScope: "Local",
      digitalDependency: "Low",
    };
  }

  if (category === "HEALTHCARE") {
    return {
      industry: "Healthcare & Medical Services",
      businessCategory: "Hospital / Specialty Clinic",
      ideaTypeKind,
      businessType: "Offline Local Business",
      revenueModel: input.businessModel || "Fee-for-Service & Health Insurance Claims",
      scalability: "Medium",
      businessStage: "Idea",
      primaryCustomerSegment: input.audience || "Patients & Local Community",
      marketScope: "Regional",
      digitalDependency: "Low",
    };
  }

  if (category === "MANUFACTURING") {
    return {
      industry: "Manufacturing & Industrial Operations",
      businessCategory: "Processing Plant / Rice Mill",
      ideaTypeKind,
      businessType: "Physical Goods / D2C",
      revenueModel: input.businessModel || "B2B Bulk Commodity Trading",
      scalability: "Medium",
      businessStage: "Idea",
      primaryCustomerSegment: input.audience || "Wholesale Grain Traders & Exporters",
      marketScope: "Regional",
      digitalDependency: "Low",
    };
  }

  return {
    industry: "AI SaaS & Software",
    businessCategory: "B2B / B2C Software Platform",
    ideaTypeKind: "Technology Startup",
    businessType: "Digital / Software / SaaS",
    revenueModel: input.businessModel || "SaaS Subscription Tiers",
    scalability: "High",
    businessStage: "Idea",
    primaryCustomerSegment: input.audience || "Digital Founders & Enterprise Teams",
    marketScope: "Global",
    digitalDependency: "High",
  };
}

export function isStartupRelatedIntent(message: string): { isStartup: boolean; category?: string } {
  const lower = message.toLowerCase().trim();

  // Explicit non-startup topic triggers
  const nonStartupTriggers = [
    { keywords: ["superman", "batman", "spiderman", "avengers", "marvel", "dc comics", "hero", "superhero"], category: "superheroes & comics" },
    { keywords: ["recipe", "cook at home", "bake cake", "curry recipe", "kitchen dish", "chef recipe", "pasta recipe", "noodle recipe"], category: "cooking recipes" },
    { keywords: ["movie", "cinema", "actor", "actress", "film", "hollywood", "bollywood", "netflix show", "anime"], category: "movies & entertainment" },
    { keywords: ["weather", "temperature", "rain forecast", "climate today"], category: "weather" },
    { keywords: ["cricket match", "football match", "soccer score", "nba score", "ipl match", "tennis match"], category: "sports scores" },
    { keywords: ["joke", "tell me a joke", "riddle", "funny story", "poem", "sing a song"], category: "entertainment" },
    { keywords: ["capital of", "who invented", "who painted", "presidential election", "history of rome", "math homework", "solve equation"], category: "general trivia & homework" },
    { keywords: ["horoscope", "astrology", "zodiac", "tarot"], category: "astrology" },
  ];

  for (const trigger of nonStartupTriggers) {
    if (trigger.keywords.some((kw) => lower.includes(kw))) {
      return { isStartup: false, category: trigger.category };
    }
  }

  // Allowed startup keywords & domain concepts
  const startupKeywords = [
    "startup", "business", "idea", "market", "validate", "validation", "customer", "discovery",
    "competitor", "competition", "rival", "moat", "product", "pricing", "model", "strategy",
    "go-to-market", "gtm", "marketing", "sales", "growth", "funding", "fundraise", "investor",
    "vc", "venture", "pitch", "deck", "saas", "entrepreneur", "entrepreneurship", "metric", "cac",
    "ltv", "pmf", "product-market fit", "financial", "revenue", "monetiz", "team", "operation",
    "score", "improve", "swat", "risk", "opportunity", "audience", "mvp", "launch", "b2b", "b2c",
    "churn", "retention", "waitlist", "traction", "scale", "feature", "workflow", "unit economics",
    "panipuri", "puri", "chaat", "restaurant", "food", "cafe", "shop", "store", "retail", "brand",
    "clothing", "gym", "tuition", "hygiene", "license", "footfall", "supplier", "franchise",
    "hospital", "clinic", "mill", "rice mill", "factory", "machinery", "bakery", "farming", "crop"
  ];

  const hasStartupKw = startupKeywords.some((kw) => lower.includes(kw));
  if (hasStartupKw) {
    return { isStartup: true };
  }

  const greetings = ["hi", "hello", "hey", "help", "good morning", "good evening", "what can you do"];
  if (greetings.some((g) => lower === g || lower.startsWith(g))) {
    return { isStartup: true };
  }

  return { isStartup: false, category: "unrelated topics" };
}

export async function generateStartupAnalysis(
  input: StartupIdeaInput
): Promise<AnalysisResultJSON> {
  const apiKey = process.env.OPENAI_API_KEY;
  const inferredProfile = inferIndustryProfile(input);
  const inferredDNA = inferBusinessDNA(input);
  const inferredClassification = inferBusinessClassification(input);
  const inferredLifecycle = inferStartupLifecycle(input);
  const category = detectDetailedStartupCategory(`${input.startupName} ${input.idea} ${input.problem} ${input.solution}`);
  const persona = getExpertPersona(category);

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const prompt = `You are an Industry-Agnostic AI Business Intelligence Platform acting as a ${persona.personaTitle}.

FOLLOW THIS STRICT 11-STEP REASONING PIPELINE:
STEP 1: Understand the business idea: "${input.idea}" for venture "${input.startupName}".
STEP 2: Detect Industry: "${inferredProfile.detectedIndustry}".
STEP 3: Detect Business Model: "${input.businessModel}".
STEP 4: Detect Category Kind: "${inferredProfile.businessCategoryKind}".
STEP 5: Construct Industry Profile with real regulatory bodies and key operating metrics.
STEP 6: Construct Business DNA matching real domain parameters.
STEP 7: Generate Startup Analysis based strictly on domain requirements. Focus on: ${persona.primaryDomainFocus.join(", ")}.
CRITICAL MANDATE: NEVER use these forbidden terms unless this is actually a software startup: ${persona.forbiddenTerms.join(", ") || "None"}.
STEP 8: Generate Startup Health diagnostics.
STEP 9: Generate Competitor Insights.
STEP 10: Generate Execution Roadmap.
STEP 11: Prepare structured context for AI Mentor.

Input Data:
Startup Name: ${input.startupName}
One-line Idea: ${input.idea}
Problem: ${input.problem}
Solution: ${input.solution}
Target Audience: ${input.audience}
Country/Region: ${input.country}
Business Model: ${input.businessModel}
Competitors: ${input.competitors || "Not specified"}

Return JSON only containing:
overallScore (integer 0-100)
industryProfile (object matching IndustryProfile schema)
businessClassification (object)
businessDNA (object)
startupLifecycle (object matching StartupLifecycle schema)
marketPotential (object)
problemValidation (object)
solutionQuality (object)
competitionLevel (object)
businessModel (object)
strengths (array)
weaknesses (array)
opportunities (array)
risks (array)
nextSteps (array tailored to current stage and industry)
investorVerdict (string)`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an industry-agnostic ${persona.personaTitle}. Always provide strictly industry-tailored JSON business analysis. Never recommend coding or SaaS metrics for non-software businesses.`,
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
        if (!parsed.industryProfile) parsed.industryProfile = inferredProfile;
        if (!parsed.businessDNA) parsed.businessDNA = inferredDNA;
        if (!parsed.businessClassification) parsed.businessClassification = inferredClassification;
        if (!parsed.startupLifecycle) parsed.startupLifecycle = inferredLifecycle;
        return parsed;
      }
    } catch (error) {
      console.error("OpenAI API call failed, using intelligent investor fallback analyzer:", error);
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
  const dna = analysisContext?.businessDNA;
  const lc = analysisContext?.startupLifecycle;
  const prof = analysisContext?.industryProfile;

  const fullText = `${dna?.startupName || analysisContext?.startupName || ""} ${dna?.industry || ""} ${analysisContext?.idea || ""} ${analysisContext?.problem || ""}`;
  const category = detectDetailedStartupCategory(fullText);
  const persona = getExpertPersona(category);

  const systemPrompt = `You are an industry-agnostic AI Business Consultant acting as a top-tier ${persona.personaTitle}.

BUSINESS REASONING CONTEXT:
- Startup/Business Name: "${dna?.startupName || analysisContext?.startupName || "Venture"}"
- Category Kind: ${prof?.businessCategoryKind || persona.ideaTypeKind}
- Detected Industry: ${prof?.detectedIndustry || dna?.industry || persona.category}
- Regulatory Body: ${prof?.regulatoryBody || "Standard Corporate Regulations"}
- Key Operating Metrics: ${prof?.keyOperatingMetrics ? prof.keyOperatingMetrics.join(", ") : persona.primaryDomainFocus[0]}
- Persona: ${persona.personaTitle}
- Current Lifecycle Stage: ${lc?.currentStage || "Validation Stage"} (Confidence: ${lc?.confidenceScore || 90}%)
- Primary Domain Focus: ${persona.primaryDomainFocus.join(", ")}

CRITICAL MANDATE:
1. Answer as an expert ${persona.personaTitle}.
2. Focus strictly on ${persona.category} domain advice (e.g. location, footfall, licensing, machinery, organic farming yield, patient care, or curriculum).
3. NEVER mention software engineering, writing code, APIs, MVP app, or CAC/LTV unless the business is ACTUALLY software.
4. Keep advice tailored to current lifecycle stage (${lc?.currentStage || "Validation Stage"}).`;

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

  return generateFallbackMentorReply(userMessage, analysisContext);
}

function generateFallbackMentorReply(
  msg: string,
  ctx?: {
    startupName: string;
    idea: string;
    problem: string;
    solution: string;
    audience: string;
    businessModel: string;
    competitors?: string | null;
    overallScore: number;
    businessClassification?: BusinessClassification | null;
    businessDNA?: BusinessDNA | null;
    startupLifecycle?: StartupLifecycle | null;
    industryProfile?: IndustryProfile | null;
  } | null
): string {
  const classification = isStartupRelatedIntent(msg);
  if (!classification.isStartup) {
    return DOMAIN_REFUSAL_MESSAGE;
  }

  const dna = ctx?.businessDNA || (ctx ? inferBusinessDNA(ctx as any) : null);
  const lc = ctx?.startupLifecycle || (ctx ? inferStartupLifecycle(ctx as any) : null);
  const prof = ctx?.industryProfile || (ctx ? inferIndustryProfile(ctx as any) : null);
  const name = dna?.startupName || ctx?.startupName || "your venture";

  const category = detectDetailedStartupCategory(`${name} ${ctx?.idea || ""} ${ctx?.problem || ""}`);
  const persona = getExpertPersona(category);

  return `As your **${persona.personaTitle}**, here is domain and stage-tailored guidance for **${name}** (${prof?.businessCategoryKind || persona.ideaTypeKind}, Stage: **${lc?.currentStage || "Validation Stage"}**):

1. **Domain Focus**: ${persona.primaryDomainFocus[0]}
2. **Key Metric**: ${prof?.keyOperatingMetrics ? prof.keyOperatingMetrics[0] : "Target customer acquisition"}
3. **Immediate Next Target**: ${lc?.nextMilestone || "Validate customer demand"}
4. **Stage Priorities**:
${lc?.suggestedPriorities ? lc.suggestedPriorities.map((p, i) => `   - Step ${i + 1}: ${p}`).join("\n") : "   - Complete customer interviews\n   - Test pricing willingness"}
5. **Regulatory & Risk Consideration**: ${prof?.regulatoryBody || "Ensure local compliance"}.`;
}

function generateFallbackAnalysis(input: StartupIdeaInput): AnalysisResultJSON {
  const name = input.startupName.trim();
  const inferredProfile = inferIndustryProfile(input);
  const inferredDNA = inferBusinessDNA(input);
  const inferredClassification = inferBusinessClassification(input);
  const inferredLifecycle = inferStartupLifecycle(input);
  const category = detectDetailedStartupCategory(`${name} ${input.idea} ${input.problem} ${input.solution}`);
  const persona = getExpertPersona(category);

  const hasCompetitors = Boolean(input.competitors && input.competitors.length > 5);
  const problemDepth = input.problem.length;
  const solutionDepth = input.solution.length;

  let score = 75;
  if (problemDepth > 60) score += 5;
  if (solutionDepth > 60) score += 5;
  if (hasCompetitors) score += 4;

  const nameHash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  score = (score + (nameHash % 12)) - 5;
  score = Math.min(94, Math.max(55, score));

  const marketScore = Math.min(98, score + 4);
  const problemScore = Math.min(95, score + 2);
  const solutionScore = Math.min(92, score - 2);
  const competitionScore = hasCompetitors ? 68 : 82;
  const businessModelScore = Math.min(90, score + 1);

  return {
    overallScore: score,
    industryProfile: inferredProfile,
    businessClassification: inferredClassification,
    businessDNA: inferredDNA,
    startupLifecycle: inferredLifecycle,
    marketPotential: {
      score: marketScore,
      summary: `High growth potential in ${input.country} targeting ${input.audience}.`,
      details: `The addressable market for ${input.idea} shows strong customer demand.`,
    },
    problemValidation: {
      score: problemScore,
      summary: "Clear pain point identified with high customer intent.",
      details: `The problem specified ("${input.problem.slice(0, 80)}...") represents a genuine pain point.`,
    },
    solutionQuality: {
      score: solutionScore,
      summary: "Strong product differentiation with actionable execution strategy.",
      details: `The solution leverages targeted positioning for ${input.audience}.`,
    },
    competitionLevel: {
      score: competitionScore,
      level: hasCompetitors ? "High" : "Medium",
      summary: hasCompetitors ? "Established competitors present; clear differentiation is vital." : "Moderate competitive landscape.",
      details: input.competitors
        ? `Existing players (${input.competitors}) require ${name} to focus heavily on unique value propositions.`
        : `No dominant monopoly identified, offering opportunity to capture early market share.`,
    },
    businessModel: {
      score: businessModelScore,
      summary: `Monetization via ${input.businessModel} provides scalable revenue potential.`,
      details: `The ${input.businessModel} strategy aligns well with customer expectations.`,
    },
    strengths: inferredDNA.keyAdvantages,
    weaknesses: inferredDNA.biggestChallenges,
    opportunities: [
      `Expand brand footprint across ${input.country}`,
      `Capitalize on ${inferredDNA.expansionPotential}`,
      `Leverage ${inferredDNA.uniqueSellingProposition}`,
    ],
    risks: inferredLifecycle.currentStageRisks,
    nextSteps: inferredLifecycle.suggestedPriorities,
    investorVerdict: `${name} (${persona.personaTitle}) is currently in the ${inferredLifecycle.currentStage} with ${inferredLifecycle.confidenceScore}% classification confidence. Focusing on ${inferredLifecycle.nextMilestone} will prepare this venture for rapid stage progression.`,
  };
}
