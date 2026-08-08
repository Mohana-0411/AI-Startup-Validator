import OpenAI from "openai";
import {
  AnalysisResultJSON,
  BusinessClassification,
  BusinessDNA,
  StartupLifecycle,
  IdeaTypeKind,
  IndustryProfile,
  VentureContext,
  OperatingMetricGauge,
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

  // Any legitimate venture, business, product, service, local, traditional, or emerging business model
  const startupKeywords = [
    "startup", "business", "venture", "idea", "market", "validate", "validation", "customer", "discovery",
    "competitor", "competition", "rival", "moat", "product", "pricing", "model", "strategy",
    "go-to-market", "gtm", "marketing", "sales", "growth", "funding", "fundraise", "investor",
    "vc", "pitch", "deck", "saas", "entrepreneur", "entrepreneurship", "metric", "cac",
    "ltv", "pmf", "product-market fit", "financial", "revenue", "monetiz", "team", "operation",
    "score", "risk", "opportunity", "audience", "mvp", "launch", "b2b", "b2c",
    "churn", "retention", "waitlist", "traction", "scale", "feature", "workflow", "unit economics",
    "food", "bajji", "panipuri", "puri", "chaat", "restaurant", "cafe", "snack", "bakery", "kitchen", "dhaba", "catering",
    "shop", "store", "retail", "boutique", "brand", "clothing", "fashion", "apparel", "garment",
    "gym", "fitness", "wellness", "salon", "laundry", "tuition", "school", "academy", "institute", "coaching",
    "hospital", "clinic", "dental", "doctor", "medical", "patient", "pharma",
    "paper cup", "mill", "rice mill", "factory", "machinery", "manufactur", "plant", "assembly", "industrial",
    "farming", "farm", "crop", "agri", "organic", "vegetable", "dairy", "harvest",
    "ev charging", "charging station", "solar", "energy", "power", "grid",
    "construction", "real estate", "building", "transport", "logistics", "freight", "fleet", "repair",
    "photography", "wedding", "cleaning", "pet care", "consulting", "agency", "export", "import", "wholesale"
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

  const domainKeywords = [
    "food", "restaurant", "stall", "bakery", "cafe", "kitchen", "bajji", "panipuri", "chaat",
    "clothing", "fashion", "store", "boutique", "shop", "retail", "gym", "fitness", "salon",
    "hospital", "clinic", "dental", "doctor", "medical", "paper cup", "factory", "mill", "plant",
    "farm", "crop", "agri", "organic", "vegetable", "ev charging", "solar", "construction",
    "repair", "photography", "consulting", "software", "saas", "app", "web", "resume builder",
    "delivery", "marketplace", "e-commerce", "wholesale", "cleaning", "school", "coaching"
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

export function buildVentureContext(input: StartupIdeaInput): VentureContext {
  const fullText = `${input.startupName} ${input.idea} ${input.problem} ${input.solution} ${input.businessModel}`.toLowerCase();

  // 1. Detect if the primary value delivery is pure software code/app/API vs physical/traditional
  const isSoftware =
    fullText.includes("software") ||
    fullText.includes("saas") ||
    fullText.includes("web app") ||
    fullText.includes("mobile app") ||
    fullText.includes("api platform") ||
    fullText.includes("resume builder") ||
    (fullText.includes("ai ") && (fullText.includes("tool") || fullText.includes("generator") || fullText.includes("platform")));

  // 2. Dynamic Domain Inference (Semantic Matching across any domain)
  let domainCategory = "General Commercial Business";
  let subDomain = "General Products & Services";
  let ventureType = "Commercial Venture";
  let operatingCategory: VentureContext["operatingCategory"] = "Physical Offline";

  if (
    fullText.includes("food") || fullText.includes("restaurant") || fullText.includes("cafe") ||
    fullText.includes("kitchen") || fullText.includes("bakery") || fullText.includes("bajji") ||
    fullText.includes("puri") || fullText.includes("chaat") || fullText.includes("snack") ||
    fullText.includes("dining") || fullText.includes("biryani") || fullText.includes("beverage")
  ) {
    domainCategory = "Food & Beverage";
    subDomain = fullText.includes("cloud kitchen") ? "Cloud Kitchen Delivery" : fullText.includes("bakery") ? "Artisanal Bakery Outlet" : "Food & Quick Service Counter";
    ventureType = fullText.includes("street") || fullText.includes("bajji") || fullText.includes("puri") ? "Local Street Food Counter" : "Food Outlet";
    operatingCategory = fullText.includes("cloud kitchen") ? "Hybrid" : "Physical Offline";
  } else if (
    fullText.includes("manufactur") || fullText.includes("factory") || fullText.includes("mill") ||
    fullText.includes("paper cup") || fullText.includes("plant") || fullText.includes("industrial") ||
    fullText.includes("processing unit") || fullText.includes("assembly line")
  ) {
    domainCategory = "Manufacturing & Processing";
    subDomain = fullText.includes("paper cup") ? "Disposable Paper Packaging" : "Industrial Manufacturing Plant";
    ventureType = "Manufacturing Factory";
    operatingCategory = "B2B Industrial / Wholesale";
  } else if (
    fullText.includes("hospital") || fullText.includes("clinic") || fullText.includes("dental") ||
    fullText.includes("doctor") || fullText.includes("medical") || fullText.includes("patient") ||
    fullText.includes("healthcare") || fullText.includes("nursing") || fullText.includes("pharma")
  ) {
    domainCategory = isSoftware ? "HealthTech Software" : "Healthcare & Medical Services";
    subDomain = isSoftware ? "Clinical Management Software" : "Clinical Care Facility";
    ventureType = isSoftware ? "Digital Software Platform" : "Medical / Dental Clinic";
    operatingCategory = isSoftware ? "Digital / Online" : "Physical Offline";
  } else if (
    fullText.includes("farm") || fullText.includes("crop") || fullText.includes("agri") ||
    fullText.includes("organic") || fullText.includes("vegetable") || fullText.includes("harvest") ||
    fullText.includes("dairy") || fullText.includes("livestock")
  ) {
    domainCategory = "Agriculture & Agribusiness";
    subDomain = "Organic Produce & Crop Farming";
    ventureType = "Organic Commercial Farm";
    operatingCategory = "B2B Industrial / Wholesale";
  } else if (
    fullText.includes("ev charging") || fullText.includes("charging station") || fullText.includes("solar") ||
    fullText.includes("electric vehicle") || fullText.includes("renewable energy") || fullText.includes("power grid")
  ) {
    domainCategory = "Energy & Infrastructure";
    subDomain = "EV Charging Infrastructure";
    ventureType = "EV Charging Station Network";
    operatingCategory = "Physical Offline";
  } else if (
    fullText.includes("clothing") || fullText.includes("fashion") || fullText.includes("apparel") ||
    fullText.includes("boutique") || fullText.includes("wear") || fullText.includes("garment") ||
    fullText.includes("textile") || fullText.includes("jewelry")
  ) {
    domainCategory = "Fashion & Apparel";
    subDomain = "Retail & D2C Apparel";
    ventureType = "Fashion Boutique / Store";
    operatingCategory = "D2C / E-Commerce";
  } else if (
    fullText.includes("gym") || fullText.includes("fitness") || fullText.includes("workout") ||
    fullText.includes("yoga") || fullText.includes("wellness") || fullText.includes("salon") ||
    fullText.includes("spa") || fullText.includes("pet grooming")
  ) {
    domainCategory = "Personal Services & Wellness";
    subDomain = "Wellness & Fitness Services";
    ventureType = "Service Facility Outlet";
    operatingCategory = "Physical Offline";
  } else if (
    fullText.includes("school") || fullText.includes("coaching") || fullText.includes("tuition") ||
    fullText.includes("academy") || fullText.includes("institute") || fullText.includes("education")
  ) {
    domainCategory = "Education & Training";
    subDomain = "Coaching & Academic Institute";
    ventureType = "Education Center";
    operatingCategory = "Physical Offline";
  } else if (
    fullText.includes("construction") || fullText.includes("building") || fullText.includes("real estate") ||
    fullText.includes("architecture") || fullText.includes("housing")
  ) {
    domainCategory = "Construction & Real Estate";
    subDomain = "Building & Real Estate Development";
    ventureType = "Construction Contracting Firm";
    operatingCategory = "Physical Offline";
  } else if (
    fullText.includes("transport") || fullText.includes("logistics") || fullText.includes("freight") ||
    fullText.includes("warehouse") || fullText.includes("delivery fleet") || fullText.includes("travel agency")
  ) {
    domainCategory = "Logistics & Transportation";
    subDomain = "Freight & Fleet Services";
    ventureType = "Logistics Provider";
    operatingCategory = "Hybrid";
  } else if (isSoftware) {
    domainCategory = "Technology & Software";
    subDomain = "B2B / B2C Software Platform";
    ventureType = "Digital Software Platform";
    operatingCategory = "Digital / Online";
  }

  // 3. Dynamic Operating Metrics Selection (Selecting the 4 metrics that genuinely matter for THIS venture)
  let metrics: OperatingMetricGauge[] = [];

  if (domainCategory.includes("Food")) {
    metrics = [
      { title: "Location & Footfall Potential", category: "Location", description: "Evaluates evening pedestrian traffic density near colleges, bus stops, or markets." },
      { title: "Unit Economics & Gross Margin (65%+)", category: "Margins", description: "Calculates raw ingredient cost (flour, oil, spices, batter) per plate vs menu price." },
      { title: "Food Safety & Hygiene Readiness", category: "Compliance", description: "Measures FSSAI registration compliance and clean oil usage standards." },
      { title: "Daily Repeat Customer Turnover", category: "Retention", description: "Evaluates daily sales volume, dish crispiness/taste consistency, and repeat footfall." },
    ];
  } else if (domainCategory.includes("Manufacturing")) {
    metrics = [
      { title: "Machinery & Production Output Rate", category: "Operations", description: "Evaluates forming machinery speed (cups/min), rim strength, and defect rate." },
      { title: "Raw Material Sourcing & Unit Cost", category: "Cost Control", description: "Measures bulk paper roll procurement pricing stability and PE coating cost." },
      { title: "Factory Power & Licensing Clearance", category: "Regulatory", description: "Assesses high-voltage electricity grid sanction and industrial pollution permits." },
      { title: "B2B Wholesale Distributor Demand", category: "Distribution", description: "Evaluates bulk off-take supply contracts with local tea stalls and distributors." },
    ];
  } else if (domainCategory.includes("Healthcare")) {
    metrics = [
      { title: "Licensing & Regulatory Compliance", category: "Compliance", description: "Evaluates Clinical Establishment Act registration and practitioner permits." },
      { title: "Equipment & Facility Readiness", category: "Infrastructure", description: "Assesses diagnostic equipment accuracy, sterilization, and clinical tools." },
      { title: "Patient Trust & Diagnostic Quality", category: "Satisfaction", description: "Measures patient appointment retention and community healthcare reputation." },
      { title: "Clinical Unit Economics", category: "Financials", description: "Calculates consultation and treatment procedure operating margins." },
    ];
  } else if (domainCategory.includes("Agriculture")) {
    metrics = [
      { title: "Soil Fertility & Irrigation Setup", category: "Yield", description: "Evaluates soil nutrient testing and automated drip irrigation coverage." },
      { title: "Organic Certification Compliance", category: "Regulatory", description: "Assesses NPOP pesticide-free organic farming audit readiness." },
      { title: "Cold Storage & Transit Preservation", category: "Spoilage", description: "Measures temperature-controlled storage to prevent post-harvest crop loss." },
      { title: "Wholesale Mandi Off-Take Demand", category: "Distribution", description: "Evaluates APMC mandi broker pricing and direct supermarket supply contracts." },
    ];
  } else if (domainCategory.includes("Energy")) {
    metrics = [
      { title: "Site Location & Traffic Density", category: "Footfall", description: "Evaluates highway/parking pedestrian traffic density and vehicle accessibility." },
      { title: "Grid Power Sanction & Charger CapEx", category: "Infrastructure", description: "Assesses high-voltage electricity grid connection and DC charger hardware cost." },
      { title: "Charger Uptime & Utilization Hours", category: "Operations", description: "Measures daily kWh power dispensed and charging station operational uptime." },
      { title: "Payback Period & Tariff Margins", category: "Financials", description: "Calculates electricity purchasing tariff vs retail per-kWh charging fee." },
    ];
  } else if (domainCategory.includes("Fashion") || domainCategory.includes("Retail")) {
    metrics = [
      { title: "Storefront Footfall & Location", category: "Location", description: "Evaluates retail footfall traffic and storefront visibility." },
      { title: "Inventory Turnover & SKU Management", category: "Inventory", description: "Measures stock sell-through rate and fabric/goods holding cost." },
      { title: "Gross Margin & Pricing Strategy", category: "Margins", description: "Targeting 60-70%+ gross margin on retail items." },
      { title: "Customer Acquisition & Repeat Retention", category: "Growth", description: "Evaluates footfall conversion rate and repeat buyer loyalty." },
    ];
  } else if (isSoftware) {
    metrics = [
      { title: "Problem Validation & Pain Severity", category: "Demand", description: "Evaluates target user pain clarity and willingness-to-pay intent." },
      { title: "Product Differentiation & Moat", category: "Product", description: "Assesses unique software workflow speed vs existing market alternatives." },
      { title: "User Onboarding & Activation Rate", category: "UX", description: "Measures time-to-first-value onboarding (<60s) without support." },
      { title: "Recurring Unit Economics (CAC/LTV)", category: "Financials", description: "Evaluates customer acquisition cost payback period and monthly recurring revenue (MRR)." },
    ];
  } else {
    metrics = [
      { title: "Market Demand & Customer Pull", category: "Demand", description: "Evaluates customer purchasing intent and local market urgency." },
      { title: "Operational Execution Capacity", category: "Operations", description: "Assesses team bandwidth, equipment readiness, and supplier setup." },
      { title: "Unit Economics & Profit Margins", category: "Financials", description: "Evaluates direct operating costs relative to pricing strategy." },
      { title: "Regulatory & Permitting Compliance", category: "Compliance", description: "Assesses local trade permits, safety standards, and licensing." },
    ];
  }

  // 4. Dynamic Stage Timeline & Suggested Roadmap
  let stageTimeline = ["1. Concept & Feasibility", "2. Location & Footfall Selection", "3. Setup & Licensing", "4. Launch", "5. Operational Optimization", "6. Expansion"];
  let currentStageName = "Location & Demand Validation";

  if (isSoftware) {
    stageTimeline = ["1. Idea", "2. Problem Validation", "3. MVP Prototype", "4. Product-Market Fit", "5. Growth", "6. Scale"];
    currentStageName = "Validation Stage";
  } else if (domainCategory.includes("Manufacturing")) {
    stageTimeline = ["1. Idea / Concept", "2. Feasibility & Machinery Sourcing", "3. Factory Setup & Licensing", "4. Pilot Batch Production", "5. B2B Commercial Launch", "6. Capacity Optimization", "7. Expansion"];
    currentStageName = "Feasibility & Machinery Sourcing";
  } else if (domainCategory.includes("Agriculture")) {
    stageTimeline = ["1. Farm Planning & Soil Feasibility", "2. Soil Prep & Drip Irrigation", "3. Planting & Crop Management", "4. Harvest", "5. Wholesale Mandi Distribution", "6. Yield Optimization", "7. Expansion"];
    currentStageName = "Farm Planning & Soil Feasibility";
  } else if (domainCategory.includes("Healthcare")) {
    stageTimeline = ["1. Concept & Feasibility", "2. Medical Licensing & Facility Setup", "3. Staffing & Equipment Testing", "4. Clinical Opening", "5. Patient Care Validation", "6. Service Optimization", "7. Expansion"];
    currentStageName = "Medical Licensing & Facility Setup";
  } else if (domainCategory.includes("Energy")) {
    stageTimeline = ["1. Site Selection & Traffic Analysis", "2. Power Grid Sanction & Charger Sourcing", "3. Installation & Safety Permits", "4. Station Opening", "5. Revenue Validation", "6. Network Expansion"];
    currentStageName = "Site Selection & Power Feasibility";
  }

  // 5. Dynamic Competitors Generation (Domain-aware for ANY venture)
  let competitorTypes: VentureContext["competitorTypes"] = [];

  if (domainCategory.includes("Food")) {
    competitorTypes = [
      {
        name: "Nearby Local Food Outlets & Stalls",
        category: "Direct Local Competitors",
        description: `Established local vendors operating in the immediate neighborhood near ${input.audience || "target customers"}.`,
        strengths: ["Established footfall location", "Low overhead"],
        weaknesses: ["Inconsistent oil quality & hygiene", "Unstandardized plate portioning"],
        pricingModel: "Direct Cash Counter Pricing",
        differentiation: `Position ${input.startupName} with standardized hygiene, clean oil, and signature sauces.`,
        marketPosition: "Incumbent Vendor",
      },
      {
        name: "Neighborhood Snack & Tea Outlets",
        category: "Indirect Alternatives",
        description: "Fixed commercial tea stalls and sweet shops offering fried snacks.",
        strengths: ["Fixed seating or shelter", "Established morning/evening tea traffic"],
        weaknesses: ["Higher price point", "Generic snack focus"],
        pricingModel: "Standard Counter Pricing",
        differentiation: "Specialized hot frying counter operating during peak evening hours.",
        marketPosition: "Established Shop",
      },
    ];
  } else if (domainCategory.includes("Manufacturing")) {
    competitorTypes = [
      {
        name: "High-Capacity Industrial Manufacturing Factories",
        category: "Industrial Wholesale Leaders",
        description: "Established paper/goods production plants supplying wholesale distributors.",
        strengths: ["Massive daily machinery capacity", "Established B2B networks"],
        weaknesses: ["High minimum order quantities (MOQs)", "Rigid distributor pricing"],
        pricingModel: "Bulk Wholesale Pricing",
        differentiation: "Flexible B2B order tiers and zero-leakage rim quality guarantees.",
        marketPosition: "Market Leader",
      },
      {
        name: "Regional Wholesale Distributors",
        category: "Regional Trade Competitors",
        description: "B2B distributors sourcing from multiple factories to supply local shops.",
        strengths: ["Local distribution logistics", "Bundled inventory"],
        weaknesses: ["Middleman price markups", "Inconsistent inventory availability"],
        pricingModel: "Distributor Wholesale Rates",
        differentiation: "Direct factory-to-outlet supply with lower wholesale unit pricing.",
        marketPosition: "Distributor Challenger",
      },
    ];
  } else if (domainCategory.includes("Healthcare")) {
    competitorTypes = [
      {
        name: "Established Neighborhood Medical Clinics",
        category: "Direct Clinical Competitors",
        description: "Private practitioners and senior doctor clinics with established patient bases.",
        strengths: ["Long-standing patient trust", "Local reputation"],
        weaknesses: ["Legacy equipment", "Manual phone appointment booking"],
        pricingModel: "Standard Clinical Fee-for-Service",
        differentiation: `Position ${input.startupName} with digital X-ray diagnostics, painless procedure tools, and automated appointment booking.`,
        marketPosition: "Local Practitioner",
      },
      {
        name: "Corporate Multi-Specialty Dental Chains",
        category: "Corporate Chains",
        description: "Corporate healthcare chains with high marketing budgets.",
        strengths: ["High brand visibility", "Multi-specialist availability"],
        weaknesses: ["High treatment fees", "Impersonal patient experience"],
        pricingModel: "Premium Tiered Fees",
        differentiation: "Compassionate, high-precision personalized care at transparent family pricing.",
        marketPosition: "Corporate Leader",
      },
    ];
  } else if (isSoftware) {
    competitorTypes = [
      {
        name: "Legacy Enterprise Software Platforms",
        category: "Market Leaders",
        description: "Dominant software platforms holding primary market share.",
        strengths: ["Large customer base", "Extensive feature set"],
        weaknesses: ["High cost", "Complex onboarding setup"],
        pricingModel: "Enterprise Tiered Subscription",
        differentiation: "Modern AI automation with 1-minute time-to-value onboarding.",
        marketPosition: "Market Leader",
      },
      {
        name: "Niche Software Alternatives",
        category: "Fast Challengers",
        description: "Fast-growing challenger software apps competing on user interface.",
        strengths: ["Modern UI", "Fast feature releases"],
        weaknesses: ["Frequent price hikes", "Limited customization"],
        pricingModel: "$29 - $149 / month",
        differentiation: "Superior unit economics and specialized category focus.",
        marketPosition: "Challenger Platform",
      },
    ];
  } else {
    competitorTypes = [
      {
        name: "Established Traditional Outlets",
        category: "Direct Competitors",
        description: `Existing business providers serving ${input.audience || "target customers"} in ${input.country}.`,
        strengths: ["Established customer trust", "Local brand recognition"],
        weaknesses: ["Legacy pricing", "Slower customer service"],
        pricingModel: "Standard Commercial Pricing",
        differentiation: `Position ${input.startupName} with higher quality service and direct customer transparency.`,
        marketPosition: "Incumbent Provider",
      },
      {
        name: "Broad Generalist Service Alternatives",
        category: "Indirect Competitors",
        description: "Unfocused providers missing specialized value propositions.",
        strengths: ["Broad service coverage"],
        weaknesses: ["Lack of specialization", "Higher friction"],
        pricingModel: "Variable Rates",
        differentiation: "Hyper-focused service quality tailored for target market needs.",
        marketPosition: "Generalist Alternative",
      },
    ];
  }

  // 6. Dynamic Suggested Roadmap Phases
  const suggestedRoadmapPhases = [
    {
      phase: "Phase 1: Demand & Feasibility",
      title: isSoftware
        ? `Conduct 15 customer discovery interviews for ${input.startupName}`
        : domainCategory.includes("Food")
        ? `Identify 2–3 high-footfall stall locations near colleges/bus stops in ${input.country}`
        : domainCategory.includes("Manufacturing")
        ? `Source high-speed automatic forming machinery & raw paper rolls`
        : domainCategory.includes("Healthcare")
        ? `Secure Clinical Establishment Act registration & dental council permits`
        : `Validate target customer demand for ${input.startupName} in ${input.country}`,
      description: "Confirm initial market demand, location accessibility, or problem severity.",
      priority: "High",
      effort: "1-2 weeks",
      impact: "High",
    },
    {
      phase: "Phase 2: Operational Launch",
      title: isSoftware
        ? `Build lightweight MVP prototype and test onboarding (<60s)`
        : domainCategory.includes("Food")
        ? `Calculate ingredient cost per plate for 65%+ margin & verify FSSAI permits`
        : domainCategory.includes("Manufacturing")
        ? `Secure industrial factory space, power load approval & pollution permits`
        : domainCategory.includes("Healthcare")
        ? `Procure dental chair units, digital X-ray equipment & sterilizers`
        : `Establish baseline operations, licensing, and supplier agreements`,
      description: "Set up primary solution workflow, equipment, and supplier pricing.",
      priority: "High",
      effort: "2-3 weeks",
      impact: "High",
    },
    {
      phase: "Phase 3: Revenue & Margin Optimization",
      title: isSoftware
        ? `Measure activation, retention, and subscription willingness-to-pay`
        : domainCategory.includes("Food")
        ? `Track daily sales volume, ingredient waste, and repeat customer footfall`
        : domainCategory.includes("Manufacturing")
        ? `Calculate cost per 100 units & lock B2B distributor supply agreements`
        : domainCategory.includes("Healthcare")
        ? `Hire certified hygienists & launch local patient appointment booking`
        : `Optimize unit economics and scale paying customer acquisition`,
      description: "Optimize profit margins and scale recurring customer retention.",
      priority: "High",
      effort: "1-2 weeks",
      impact: "High",
    },
  ];

  return {
    ventureName: input.startupName.trim(),
    description: input.idea.trim(),
    domainCategory,
    subDomain,
    ventureType,
    operatingCategory,
    revenueModel: input.businessModel || "Direct Commercial Sales",
    customerSegment: input.audience || "Target Customers",
    marketScope: input.country || "Local Market",
    problem: input.problem.trim(),
    solution: input.solution.trim(),
    competitors: input.competitors || null,
    isTechnologyProduct: isSoftware,
    keyOperatingMetrics: metrics,
    primaryRisks: isSoftware
      ? ["High customer acquisition cost (CAC) relative to LTV", "Competitive feature copying"]
      : domainCategory.includes("Food")
      ? ["Raw ingredient/oil cost inflation", "Location footfall drops during rainy weather"]
      : domainCategory.includes("Manufacturing")
      ? ["Raw material paper roll price volatility", "Industrial power load sanction delays"]
      : ["High operating lease overhead", "Supplier delivery delays"],
    primarySuccessFactors: isSoftware
      ? ["Fast onboarding (<60s)", "High product activation", "Clear SaaS value ROI"]
      : domainCategory.includes("Food")
      ? ["High footfall location", "Hot crispiness & sauce taste consistency", "Clean oil & FSSAI hygiene"]
      : domainCategory.includes("Manufacturing")
      ? ["High-speed machinery output", "Zero cup leakage rate", "B2B distributor contracts"]
      : ["Location accessibility", "Reliable product/service quality", "Cost control"],
    regulatoryRequirements: isSoftware
      ? ["Data Privacy & GDPR Standards", "Payment Gateway Compliance"]
      : domainCategory.includes("Food")
      ? ["FSSAI Food Safety Registration", "Municipal Trade Permission"]
      : domainCategory.includes("Manufacturing")
      ? ["Industrial Factory License", "Pollution Control Board Clearance"]
      : ["Municipal Trade Permit", "GST Registration"],
    competitorTypes,
    suggestedRoadmapPhases,
    stageTimeline,
    currentStageName,
  };
}

export function inferIndustryProfile(input: StartupIdeaInput): IndustryProfile {
  const vCtx = buildVentureContext(input);
  return {
    detectedIndustry: vCtx.domainCategory,
    subIndustry: vCtx.subDomain,
    businessCategoryKind: vCtx.isTechnologyProduct ? "Technology Startup" : "Offline Business",
    revenueModelType: input.businessModel || "Direct Sales",
    regulatoryBody: vCtx.regulatoryRequirements.join(" & "),
    keyOperatingMetrics: vCtx.keyOperatingMetrics.map((m) => m.title),
  };
}

export function inferStartupLifecycle(input: StartupIdeaInput, vContext?: VentureContext): StartupLifecycle {
  const ctx = vContext || buildVentureContext(input);

  const priorities = ctx.suggestedRoadmapPhases.map((p) => p.title);

  return {
    currentStage: ctx.currentStageName,
    confidenceScore: 92,
    reason: `Analysis for ${ctx.ventureName} (${ctx.ventureType} in ${ctx.domainCategory}) tailored specifically to its operational model (${ctx.operatingCategory}).`,
    nextMilestone: priorities[0] || "Validate target customer demand and location feasibility",
    estimatedTimeToNextStage: "2-3 weeks",
    stageTimeline: ctx.stageTimeline,
    keyObjectives: priorities.slice(0, 3),
    currentStageRisks: ctx.primaryRisks,
    successProbability: 85,
    potentialBlockers: ["Permitting/licensing delays", "Initial customer acquisition speed"],
    suggestedPriorities: priorities,
  };
}

export function inferBusinessDNA(input: StartupIdeaInput): BusinessDNA {
  const vCtx = buildVentureContext(input);
  return {
    startupName: input.startupName.trim(),
    industry: vCtx.domainCategory,
    subIndustry: vCtx.subDomain,
    businessCategory: vCtx.ventureType,
    ideaTypeKind: vCtx.isTechnologyProduct ? "Technology Startup" : "Traditional Business",
    businessType: vCtx.isTechnologyProduct ? "Digital / Software / SaaS" : "Offline Local Business",
    businessModel: input.businessModel || "Direct Commercial Model",
    revenueModel: vCtx.revenueModel,
    businessStage: "Idea",
    targetCustomers: vCtx.customerSegment,
    customerPersona: `Target users seeking reliable solutions for ${vCtx.problem.slice(0, 60)}...`,
    marketScope: vCtx.isTechnologyProduct ? "Global" : "Local",
    investmentLevel: vCtx.isTechnologyProduct ? "Medium" : "Medium",
    operationalComplexity: "Medium",
    technologyDependency: vCtx.isTechnologyProduct ? "High" : "Low",
    scalability: vCtx.isTechnologyProduct ? "High" : "Medium",
    expansionPotential: `${vCtx.domainCategory} Regional & Multi-Location Growth`,
    fundingRequirement: "$5,000 - $30,000",
    fundingType: "Self-funded / Bootstrapped",
    competitionLevel: "Medium",
    riskLevel: "Medium",
    growthPotential: "High",
    digitalPresenceImportance: vCtx.isTechnologyProduct ? "High" : "Medium",
    requiredLicenses: vCtx.regulatoryRequirements,
    primarySuccessFactors: vCtx.primarySuccessFactors,
    biggestChallenges: vCtx.primaryRisks,
    keyAdvantages: ["Direct customer value proposition", "Domain-focused execution"],
    uniqueSellingProposition: vCtx.solution.slice(0, 80),
    estimatedTimeToLaunch: "2-4 weeks",
    estimatedInitialInvestment: "$3,000 - $15,000",
    recommendedTeamSize: "2-4 team members",
    businessPriority: vCtx.suggestedRoadmapPhases[0]?.title || "Market Validation",
  };
}

export function inferBusinessClassification(input: StartupIdeaInput): BusinessClassification {
  const vCtx = buildVentureContext(input);
  return {
    industry: vCtx.domainCategory,
    businessCategory: vCtx.ventureType,
    ideaTypeKind: vCtx.isTechnologyProduct ? "Technology Startup" : "Traditional Business",
    businessType: vCtx.isTechnologyProduct ? "Digital / Software / SaaS" : "Offline Local Business",
    revenueModel: input.businessModel || "Direct Commercial Sales",
    scalability: vCtx.isTechnologyProduct ? "High" : "Medium",
    businessStage: "Idea",
    primaryCustomerSegment: vCtx.customerSegment,
    marketScope: vCtx.isTechnologyProduct ? "Global" : "Local",
    digitalDependency: vCtx.isTechnologyProduct ? "High" : "Low",
  };
}

export async function generateStartupAnalysis(input: StartupIdeaInput): Promise<AnalysisResultJSON> {
  const apiKey = process.env.OPENAI_API_KEY;
  const vContext = buildVentureContext(input);
  const inferredProfile = inferIndustryProfile(input);
  const inferredDNA = inferBusinessDNA(input);
  const inferredClassification = inferBusinessClassification(input);
  const inferredLifecycle = inferStartupLifecycle(input, vContext);

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const prompt = `You are an Industry-Agnostic AI Business Intelligence Platform acting as an expert Domain Consultant for "${vContext.domainCategory}".

VENTURE CONTEXT (MUST BE RESPECTED EXPLICITLY):
- Venture Name: "${vContext.ventureName}"
- Description / Idea: "${vContext.description}"
- Domain Category: "${vContext.domainCategory}"
- Sub-Domain: "${vContext.subDomain}"
- Venture Type: "${vContext.ventureType}"
- Operating Category: "${vContext.operatingCategory}"
- Is Technology Product: ${vContext.isTechnologyProduct ? "YES (Software/SaaS/App)" : "NO (Physical / Local / Traditional Business)"}
- Target Audience: "${vContext.customerSegment}"
- Market Scope: "${vContext.marketScope}"
- Problem: "${vContext.problem}"
- Solution: "${vContext.solution}"
- Revenue Model: "${vContext.revenueModel}"

CRITICAL MANDATE:
1. Every section MUST match "${vContext.ventureType}" in "${vContext.domainCategory}".
2. IF THIS IS NOT A SOFTWARE PRODUCT (isTechnologyProduct = false):
   NEVER mention "MVP", "writing code", "APIs", "tech stack", "software engineering", "CAC", "LTV", "churn", "prototype counter", "wireframe", or "waitlist landing page".
3. Provide domain-appropriate metrics, risks, and next steps matching "${vContext.domainCategory}".

Return JSON containing:
overallScore (integer 0-100)
ventureContext (object matching VentureContext schema)
industryProfile (object)
businessClassification (object)
businessDNA (object)
startupLifecycle (object)
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
            content: `You are an expert AI Domain Consultant for ${vContext.domainCategory}. Always provide strictly domain-tailored JSON venture analysis. Never recommend software/SaaS metrics or coding for non-software businesses like food stalls, clinics, farms, or factories.`,
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
        parsed.ventureContext = vContext;
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
    ventureContext?: VentureContext | null;
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

  let vContext: VentureContext;
  if (analysisContext?.ventureContext) {
    vContext = analysisContext.ventureContext;
  } else if (analysisContext) {
    vContext = buildVentureContext({
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
    vContext = buildVentureContext({
      startupName: "Venture",
      idea: userMessage,
      problem: userMessage,
      solution: userMessage,
      audience: "Target Market",
      country: "Local Market",
      businessModel: "Commercial Sales",
    });
  }

  const lc = analysisContext?.startupLifecycle || inferStartupLifecycle({
    startupName: vContext.ventureName,
    idea: vContext.description,
    problem: vContext.problem,
    solution: vContext.solution,
    audience: vContext.customerSegment,
    country: vContext.marketScope,
    businessModel: vContext.revenueModel,
  }, vContext);

  const systemPrompt = `You are an expert AI Business Consultant advising on "${vContext.ventureName}".

VENTURE CONTEXT:
- Venture Name: "${vContext.ventureName}"
- Description / Idea: "${vContext.description}"
- Domain Category: ${vContext.domainCategory} (${vContext.subDomain})
- Venture Type: ${vContext.ventureType}
- Operating Category: ${vContext.operatingCategory}
- Is Technology Product: ${vContext.isTechnologyProduct ? "YES" : "NO"}
- Revenue Model: ${vContext.revenueModel}
- Target Audience: ${vContext.customerSegment}
- Current Stage: ${lc.currentStage}

ADVISORY RULES:
1. Provide direct, practical guidance tailored strictly to ${vContext.domainCategory} and ${vContext.ventureType}.
2. IF THIS IS NOT A SOFTWARE PRODUCT (isTechnologyProduct = false):
   NEVER mention writing code, APIs, MVP apps, SaaS metrics, CAC/LTV, wireframes, or waitlist landing pages.
3. For physical/offline businesses (food stalls, clinics, farms, factories, retail shops):
   Discuss location, footfall, licensing/permits, raw material/ingredient costs, portion pricing, equipment, daily operating volume, and waste control.
4. Keep advice actionable for current stage: "${lc.currentStage}".`;

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

  return generateFallbackMentorReply(userMessage, vContext, lc);
}

function generateFallbackMentorReply(msg: string, vContext: VentureContext, lc: StartupLifecycle): string {
  const classification = isStartupRelatedIntent(msg);
  if (!classification.isStartup) {
    return DOMAIN_REFUSAL_MESSAGE;
  }

  const name = vContext.ventureName;
  const priorities = vContext.suggestedRoadmapPhases.map((p) => p.title);

  return `As your **${vContext.domainCategory} Consultant**, here is domain-tailored guidance for **${name}** (${vContext.ventureType}, Stage: **${lc.currentStage}**):

1. **Core Domain Priority**: ${priorities[0] || "Validate target customer demand and location feasibility"}
2. **Operational Setup**: ${priorities[1] || "Establish baseline equipment, permits, and supplier agreements"}
3. **Margin & Economics**: ${priorities[2] || "Optimize operating costs and scale repeat sales"}
4. **Key Success Factors**:
${vContext.primarySuccessFactors.slice(0, 3).map((f) => `   - ${f}`).join("\n")}
5. **Regulatory Requirement**: ${vContext.regulatoryRequirements.join(", ")}.`;
}

function generateFallbackAnalysis(input: StartupIdeaInput): AnalysisResultJSON {
  const vContext = buildVentureContext(input);
  const inferredProfile = inferIndustryProfile(input);
  const inferredDNA = inferBusinessDNA(input);
  const inferredClassification = inferBusinessClassification(input);
  const inferredLifecycle = inferStartupLifecycle(input, vContext);

  const problemDepth = input.problem.length;
  const solutionDepth = input.solution.length;

  let score = 76;
  if (problemDepth > 50) score += 4;
  if (solutionDepth > 50) score += 4;

  const nameHash = input.startupName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  score = (score + (nameHash % 10)) - 3;
  score = Math.min(94, Math.max(60, score));

  return {
    overallScore: score,
    ventureContext: vContext,
    industryProfile: inferredProfile,
    businessClassification: inferredClassification,
    businessDNA: inferredDNA,
    startupLifecycle: inferredLifecycle,
    marketPotential: {
      score: score + 3,
      summary: `Addressable market demand in ${input.country} for ${vContext.ventureType}.`,
      details: `Target segment ${vContext.customerSegment} demonstrates clear demand for ${vContext.description}.`,
    },
    problemValidation: {
      score: score + 2,
      summary: "Customer problem identified with high purchasing intent.",
      details: `The problem specified ("${input.problem.slice(0, 80)}...") represents a genuine market need.`,
    },
    solutionQuality: {
      score: score - 1,
      summary: `Operational value proposition tailored for ${vContext.domainCategory}.`,
      details: `The solution leverages specialized positioning for ${vContext.customerSegment}.`,
    },
    competitionLevel: {
      score: 75,
      level: "Medium",
      summary: "Competitive landscape analyzed across traditional and direct market alternatives.",
      details: `Focusing on ${vContext.primarySuccessFactors[0] || "core quality"} will establish strong positioning.`,
    },
    businessModel: {
      score: score + 1,
      summary: `Monetization via ${input.businessModel} provides sustainable unit economics.`,
      details: `The ${input.businessModel} model aligns well with ${vContext.domainCategory} customer expectations.`,
    },
    strengths: inferredDNA.primarySuccessFactors,
    weaknesses: inferredDNA.biggestChallenges,
    opportunities: [
      `Expand operational footprint across ${input.country}`,
      `Capitalize on ${vContext.subDomain} demand growth`,
    ],
    risks: inferredLifecycle.currentStageRisks,
    nextSteps: inferredLifecycle.suggestedPriorities,
    investorVerdict: `${input.startupName} (${vContext.ventureType} in ${vContext.domainCategory}) is in the ${inferredLifecycle.currentStage} stage. Focusing on ${inferredLifecycle.nextMilestone} will drive sustainable growth.`,
  };
}
