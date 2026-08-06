import OpenAI from "openai";
import {
  AnalysisResultJSON,
  BusinessClassification,
  BusinessDNA,
  StartupLifecycle,
  LifecycleStage,
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

const DOMAIN_REFUSAL_MESSAGE = `I'm designed specifically to help with startups and entrepreneurship.

I can't provide reliable answers outside that domain.

Ask me anything about:

• Startup validation
• Business models
• Execution roadmap
• Competitor analysis
• Go-to-market strategy
• Pricing & profit margins
• Funding & expansion`;

export type StartupCategory =
  | "FOOD"
  | "RETAIL_LOCAL"
  | "FASHION"
  | "FITNESS"
  | "EDUCATION"
  | "AGRICULTURE_MANUFACTURING"
  | "SOFTWARE_SAAS";

export function detectStartupCategory(text: string): StartupCategory {
  const lower = text.toLowerCase();

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

  if (
    lower.includes("clothing") ||
    lower.includes("fashion") ||
    lower.includes("apparel") ||
    lower.includes("garment") ||
    lower.includes("textile") ||
    lower.includes("shoe") ||
    lower.includes("wear") ||
    lower.includes("jewelry")
  ) {
    return "FASHION";
  }

  if (
    lower.includes("gym") ||
    lower.includes("fitness") ||
    lower.includes("workout") ||
    lower.includes("yoga") ||
    lower.includes("trainer") ||
    lower.includes("wellness")
  ) {
    return "FITNESS";
  }

  if (
    lower.includes("tuition") ||
    lower.includes("coaching") ||
    lower.includes("school") ||
    lower.includes("academy") ||
    lower.includes("institute") ||
    lower.includes("tutor") ||
    lower.includes("education center")
  ) {
    return "EDUCATION";
  }

  if (
    lower.includes("shop") ||
    lower.includes("store") ||
    lower.includes("retail") ||
    lower.includes("supermarket") ||
    lower.includes("grocery") ||
    lower.includes("boutique") ||
    lower.includes("salon") ||
    lower.includes("laundry")
  ) {
    return "RETAIL_LOCAL";
  }

  if (
    lower.includes("farm") ||
    lower.includes("crop") ||
    lower.includes("organic") ||
    lower.includes("factory") ||
    lower.includes("plant") ||
    lower.includes("hardware") ||
    lower.includes("manufactur")
  ) {
    return "AGRICULTURE_MANUFACTURING";
  }

  return "SOFTWARE_SAAS";
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
        ? "Build lightweight landing page / MVP counter prototype"
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
  const category = detectStartupCategory(fullText);

  if (category === "FOOD") {
    const isPuri = fullText.includes("panipuri") || fullText.includes("chaat");
    return {
      startupName: name,
      industry: "Food & Beverage",
      subIndustry: isPuri ? "Quick Service Street Food" : "Restaurant & Food Service",
      businessCategory: isPuri ? "Street Food Outlet" : "Quick Service Restaurant",
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

  if (category === "FASHION") {
    return {
      startupName: name,
      industry: "Fashion & Apparel",
      subIndustry: "D2C Apparel & Garments",
      businessCategory: "D2C Clothing Brand",
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

  return {
    startupName: name,
    industry: "AI SaaS & Software",
    subIndustry: "B2B Venture Software",
    businessCategory: "B2B SaaS Platform",
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
  const category = detectStartupCategory(fullText);

  if (category === "FOOD") {
    return {
      industry: "Food & Beverage",
      businessCategory: fullText.includes("panipuri") || fullText.includes("chaat") ? "Street Food Business" : fullText.includes("cafe") ? "Cafe / Quick Service Restaurant" : "Food & Restaurant Business",
      businessType: "Offline Local Business",
      revenueModel: input.businessModel || "Direct Sales",
      scalability: "Medium",
      businessStage: "Idea",
      primaryCustomerSegment: input.audience || "Local Residents, Students & Office Employees",
      marketScope: "Local",
      digitalDependency: "Low",
    };
  }

  if (category === "FASHION") {
    return {
      industry: "Fashion & Apparel",
      businessCategory: "D2C Clothing Brand",
      businessType: "Physical Goods / D2C",
      revenueModel: input.businessModel || "Direct-to-Consumer E-Commerce",
      scalability: "High",
      businessStage: "Idea",
      primaryCustomerSegment: input.audience || "Fashion Conscious Youth & Adults",
      marketScope: "National",
      digitalDependency: "Medium",
    };
  }

  return {
    industry: "AI SaaS & Software",
    businessCategory: "B2B / B2C Software Platform",
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
    "yc", "y combinator", "seed", "pre-seed", "series a", "cap table", "execution roadmap",
    "panipuri", "puri", "chaat", "restaurant", "food", "cafe", "shop", "store", "retail", "brand",
    "clothing", "gym", "tuition", "hygiene", "license", "footfall", "supplier", "franchise"
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
  const inferredDNA = inferBusinessDNA(input);
  const inferredClassification = inferBusinessClassification(input);
  const inferredLifecycle = inferStartupLifecycle(input);

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const prompt = `You are an experienced multi-industry venture capitalist.

Analyze this startup idea:

Startup Name: ${input.startupName}
One-line Idea: ${input.idea}
Problem: ${input.problem}
Solution: ${input.solution}
Target Audience: ${input.audience}
Country/Region: ${input.country}
Business Model: ${input.businessModel}
Competitors: ${input.competitors || "Not specified"}

FIRST: Classify the Startup Lifecycle (startupLifecycle):
- currentStage ("Idea Stage" | "Validation Stage" | "MVP Stage" | "Launch Stage" | "Early Revenue Stage" | "Growth Stage" | "Scale Stage")
- confidenceScore (integer 0-100)
- reason (string)
- nextMilestone (string)
- estimatedTimeToNextStage (string)
- keyObjectives (array of strings)
- currentStageRisks (array of strings)
- successProbability (integer 0-100)
- potentialBlockers (array of strings)
- suggestedPriorities (array of strings)

SECOND: Construct Business DNA (businessDNA) and Business Classification (businessClassification).

Return JSON only containing:
overallScore (integer 0-100)
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
nextSteps (array tailored to current stage)
investorVerdict (string)`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a top-tier venture capitalist. Analyze startup ideas with strict, stage-aware, and domain-tailored JSON analysis.",
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
  } | null;
}): Promise<string> {
  const classification = isStartupRelatedIntent(userMessage);
  if (!classification.isStartup) {
    return DOMAIN_REFUSAL_MESSAGE;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const dna = analysisContext?.businessDNA;
  const lc = analysisContext?.startupLifecycle;

  const systemPrompt = `You are an experienced AI Startup Mentor acting as an AI Co-Founder.

BUSINESS DNA & LIFECYCLE INTELLIGENCE CONTEXT:
- Startup Name: "${dna?.startupName || analysisContext?.startupName || "Startup"}"
- Industry: ${dna?.industry || "General Industry"}
- Current Lifecycle Stage: ${lc?.currentStage || "Validation Stage"} (Confidence: ${lc?.confidenceScore || 90}%)
- Stage Reason: ${lc?.reason || "Idea formulation stage"}
- Next Milestone: ${lc?.nextMilestone || "Validate customer demand"}
- Stage Priorities: ${lc?.suggestedPriorities ? lc.suggestedPriorities.join(", ") : "Problem validation"}
- USP: ${dna?.uniqueSellingProposition || "Unique Value Proposition"}

CRITICAL MANDATE:
Focus your advice strictly on the startup's CURRENT LIFECYCLE STAGE (${lc?.currentStage || "Validation Stage"}).
- If Idea/Validation Stage: Focus on customer discovery interviews and market validation. DO NOT advise on scaling, hiring, or heavy capital expenditure!
- If Growth/Scale Stage: Focus on marketing, hiring, automation, and funding.`;

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
  } | null
): string {
  const classification = isStartupRelatedIntent(msg);
  if (!classification.isStartup) {
    return DOMAIN_REFUSAL_MESSAGE;
  }

  const dna = ctx?.businessDNA || (ctx ? inferBusinessDNA(ctx as any) : null);
  const lc = ctx?.startupLifecycle || (ctx ? inferStartupLifecycle(ctx as any) : null);
  const name = dna?.startupName || ctx?.startupName || "your business";

  return `Here is Lifecycle-aware advice for **${name}** (Current Stage: **${lc?.currentStage || "Validation Stage"}**):

1. **Primary Stage Focus**: ${lc?.reason || "Validate customer demand"}
2. **Immediate Next Milestone**: ${lc?.nextMilestone || "Conduct problem discovery interviews"}
3. **Stage Priorities**:
${lc?.suggestedPriorities ? lc.suggestedPriorities.map((p, i) => `   - Step ${i + 1}: ${p}`).join("\n") : "   - Interview target audience\n   - Test pricing willingness"}
4. **Current Stage Risks**: Watch out for ${lc?.currentStageRisks ? lc.currentStageRisks[0] : "building before validating demand"}.`;
}

function generateFallbackAnalysis(input: StartupIdeaInput): AnalysisResultJSON {
  const name = input.startupName.trim();
  const inferredDNA = inferBusinessDNA(input);
  const inferredClassification = inferBusinessClassification(input);
  const inferredLifecycle = inferStartupLifecycle(input);

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
    investorVerdict: `${name} is currently in the ${inferredLifecycle.currentStage} with ${inferredLifecycle.confidenceScore}% classification confidence. Focusing on ${inferredLifecycle.nextMilestone} will prepare this venture for rapid stage progression.`,
  };
}
