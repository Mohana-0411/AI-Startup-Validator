import OpenAI from "openai";
import { AnalysisResultJSON } from "./types";

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

  // Allowed greetings
  const greetings = ["hi", "hello", "hey", "help", "good morning", "good evening", "what can you do"];
  if (greetings.some((g) => lower === g || lower.startsWith(g))) {
    return { isStartup: true };
  }

  // Default to non-startup if no startup intent matched
  return { isStartup: false, category: "unrelated topics" };
}

export async function generateStartupAnalysis(
  input: StartupIdeaInput
): Promise<AnalysisResultJSON> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const prompt = `You are an experienced multi-industry business investor.

Analyze this startup idea:

Startup Name: ${input.startupName}
One-line Idea: ${input.idea}
Problem: ${input.problem}
Solution: ${input.solution}
Target Audience: ${input.audience}
Country/Region: ${input.country}
Business Model: ${input.businessModel}
Competitors: ${input.competitors || "Not specified"}

IMPORTANT: First identify if this business is a physical/local business (e.g. food stall, restaurant, panipuri shop, retail store, gym, fashion brand) or a software/digital startup. Tailor your analysis and next steps specifically to that business type. Do NOT recommend writing code or software metrics for physical businesses!

Return JSON only.

Include:
overallScore (integer between 0 and 100)
marketPotential (object with integer score 0-100, concise summary, and details string)
problemValidation (object with integer score 0-100, concise summary, and details string)
solutionQuality (object with integer score 0-100, concise summary, and details string)
competitionLevel (object with integer score 0-100, level: "Low"|"Medium"|"High", concise summary, and details string)
businessModel (object with integer score 0-100, concise summary, and details string)
strengths (array of 3-5 concise bullet points)
weaknesses (array of 3-5 concise bullet points)
opportunities (array of 3-5 concise bullet points)
risks (array of 3-5 concise bullet points)
nextSteps (array of 4-6 practical, actionable steps for the founder tailored to their specific business category)
investorVerdict (a 2-3 sentence executive summary from a seasoned business partner perspective)

Keep answers concise and practical.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an experienced venture capitalist and business advisor. Analyze startup ideas with strict, fair, domain-tailored, and highly actionable JSON analysis.",
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
  } | null;
}): Promise<string> {
  // Step 1: Pre-classification via Intent Classifier
  const classification = isStartupRelatedIntent(userMessage);
  if (!classification.isStartup) {
    return DOMAIN_REFUSAL_MESSAGE;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const startupText = `${analysisContext?.startupName || ""} ${analysisContext?.idea || ""} ${analysisContext?.businessModel || ""} ${userMessage}`;
  const category = detectStartupCategory(startupText);

  const systemPrompt = `You are an experienced, multi-industry AI Startup Mentor. You advise physical businesses (restaurants, retail, food stalls, panipuri shops, fashion brands, gyms, tuition centers) as well as software/AI startups.

CRITICAL CLASSIFICATION & DOMAIN ADAPTATION INSTRUCTIONS:

STEP 1: Determine whether the user's message is related to business or startups.
IF THE MESSAGE IS UNRELATED (e.g. Superman, movies, sports, cooking recipes, math homework):
Respond ONLY with this exact refusal:
"${DOMAIN_REFUSAL_MESSAGE}"

STEP 2: IDENTIFY THE BUSINESS CATEGORY FROM CONTEXT:
Active Category Detected: ${category}

STEP 3: TAILOR YOUR ADVICE STRICTLY TO THE DETECTED CATEGORY:

• IF FOOD / RESTAURANT / PANIPURI / STREET FOOD BUSINESS:
  Focus on: High-footfall location selection, strict hygiene & taste consistency, fresh ingredient sourcing, daily operating costs, food licenses (FSSAI/GST), unit economics & profit margins, local competitors, repeat customer loyalty, food delivery platforms (Zomato/Swiggy), franchise expansion.
  STRICT PROHIBITION: DO NOT mention writing code, MVP software, APIs, software architecture, customer activation metrics, or North Star metrics!

• IF RETAIL SHOP / LOCAL PHYSICAL STORE:
  Focus on: Foot traffic, store location, inventory turnover, supplier negotiations, working capital, store presentation, local marketing.
  STRICT PROHIBITION: DO NOT mention coding or software architecture.

• IF FASHION / CLOTHING BRAND:
  Focus on: Fabric sourcing, manufacturing costs, inventory management, Instagram/social media marketing, influencer seeding, return rates, brand positioning.

• IF FITNESS / GYM / WELLNESS:
  Focus on: Location selection, equipment leasing, monthly membership tiers, trainer hiring & retention, member churn, local trial offers.

• IF EDUCATION / TUITION CENTER:
  Focus on: Teacher quality, student pass rate & success stories, course fee structure, parent trust, seasonal enrollment cycles, local word-of-mouth.

• IF SOFTWARE / AI SAAS / APP:
  Focus on: MVP development, product validation, pricing tiers, customer discovery, go-to-market, CAC, LTV, retention, scaling, fundraising.

ALWAYS REFERENCE THE USER'S ACTUAL STARTUP NAME ("${analysisContext?.startupName || "your business"}") AND PROVIDE DOMAIN-RELEVANT RECOMMENDATIONS.`;

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

  // Fallback Mentor Engine if OpenAI API key is missing or fails
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
  } | null
): string {
  const classification = isStartupRelatedIntent(msg);
  if (!classification.isStartup) {
    return DOMAIN_REFUSAL_MESSAGE;
  }

  const name = ctx?.startupName || "your business";
  const score = ctx?.overallScore || 78;
  const fullText = `${name} ${ctx?.idea || ""} ${ctx?.businessModel || ""} ${msg}`;
  const category = detectStartupCategory(fullText);

  // 1. Food / Panipuri / Restaurant Category
  if (category === "FOOD") {
    return `Here is tailored business advice for **${name}** (Food & Beverage Business):

1. **Location & Footfall**: Choose a high-traffic spot near colleges, transit hubs, or commercial markets with high evening footfall.
2. **Hygiene & Taste Consistency**: Standardize your recipes and water quality so every serving delivers identical flavor. Clean, branded presentation builds high trust.
3. **Unit Economics & Margins**: Maintain raw ingredient costs below 30-35% of selling price to secure healthy 65%+ gross margins.
4. **Licensing & Compliance**: Secure necessary food authority licenses (FSSAI/Local Municipal permits) and GST registration early.
5. **Local Delivery & Scaling**: Partner with local food delivery platforms (Zomato/Swiggy) and package items safely to explore franchise model opportunities as brand demand grows.`;
  }

  // 2. Fashion / Clothing Category
  if (category === "FASHION") {
    return `Here is tailored strategy advice for **${name}** (Fashion & Apparel Brand):

1. **Supplier & Fabric Sourcing**: Partner directly with reliable textile mills or garment manufacturers to maintain fabric quality and reduce per-piece production cost.
2. **Branding & Social Proof**: Invest heavily in high-quality Instagram/TikTok reels, influencer seeding, and lifestyle photography targeting ${ctx?.audience || "your target customers"}.
3. **Inventory Management**: Start with limited-edition batch drops to test demand before placing large inventory orders.
4. **Return Rate Control**: Provide detailed size guides and fabric care instructions to keep customer return rates below 10%.`;
  }

  // 3. Fitness / Gym Category
  if (category === "FITNESS") {
    return `Here is tailored execution advice for **${name}** (Fitness & Gym Business):

1. **Facility Location & Space**: Secure a ground/first-floor space with easy parking and ventilation in a residential/office catchment area.
2. **Equipment Leasing**: Option for equipment leasing to minimize upfront capital expenditure while offering modern machinery.
3. **Membership Pricing Tiers**: Offer quarterly and annual prepay memberships with free initial personal training consultations to drive cash flow.
4. **Trainer Hiring & Community**: Hire certified trainers on incentive-based performance models to reduce member churn during renewal months.`;
  }

  // 4. Education / Tuition Category
  if (category === "EDUCATION") {
    return `Here is tailored operational advice for **${name}** (Education & Tuition Center):

1. **Teacher Excellence & Pass Rate**: Hire top subject experts and maintain small batch sizes to ensure high individual student attention and score improvements.
2. **Parent Trust & Transparency**: Conduct monthly parent-teacher meetings and share detailed progress reports to build strong word-of-mouth referrals.
3. **Fee Structure & Scholarships**: Structure affordable monthly or term fees with merit scholarships to attract top-performing students.
4. **Infrastructure & Location**: Ensure quiet, well-lit classrooms equipped with modern digital whiteboards and comfortable seating.`;
  }

  // 5. Retail / Local Store Category
  if (category === "RETAIL_LOCAL") {
    return `Here is tailored retail advice for **${name}** (Local Retail Store):

1. **Prime Storefront Location**: Select a storefront with high visibility and natural foot traffic among ${ctx?.audience || "target shoppers"}.
2. **Inventory Turnover & Display**: Curate fast-moving stock and arrange high-margin impulse items near the checkout counter.
3. **Supplier Credit Terms**: Negotiate 30-to-60 day credit terms with distributors to maintain healthy cash flow.
4. **Customer Loyalty Program**: Launch a simple phone-number based reward program offering discounts on repeat visits.`;
  }

  // 6. Agriculture / Manufacturing Category
  if (category === "AGRICULTURE_MANUFACTURING") {
    return `Here is tailored operational advice for **${name}** (Manufacturing & Supply Business):

1. **Raw Material Sourcing**: Lock in long-term supply contracts to hedge against commodity price fluctuations.
2. **Quality Assurance & Safety**: Implement strict quality checks at every production stage to ensure zero batch defects.
3. **Distributor Networks**: Build relationships with regional B2B wholesalers and logistics partners for bulk distribution.
4. **Capacity Utilization**: Optimize machine uptime and batch processing to reduce overhead costs per unit.`;
  }

  // 7. Software / AI SaaS Category (Default for tech startups)
  return `Here is tailored venture strategy for **${name}** (Software & Digital Product):

1. **Customer Discovery & Validation**: Conduct 15 discovery calls with ${ctx?.audience || "target users"} to validate that "${ctx?.problem ? ctx.problem.slice(0, 45) : "the pain point"}" is an urgent priority.
2. **MVP Iteration**: Build a lightweight prototype or landing page smoke test focusing 100% on the core value proposition.
3. **Pricing & Unit Economics**: Test value-based pricing tiers for ${ctx?.businessModel || "your business model"} and measure early trial-to-paid conversion.
4. **Go-to-Market Channels**: Focus on 1 primary acquisition channel (SEO, outbound sales, or content loops) to drive sustainable retention.`;
}

function generateFallbackAnalysis(input: StartupIdeaInput): AnalysisResultJSON {
  const name = input.startupName.trim();
  const fullText = `${name} ${input.idea} ${input.businessModel} ${input.problem} ${input.solution}`;
  const category = detectStartupCategory(fullText);
  const isSoftware = category === "SOFTWARE_SAAS";

  const hasCompetitors = Boolean(input.competitors && input.competitors.length > 5);
  const problemDepth = input.problem.length;
  const solutionDepth = input.solution.length;

  let score = 74;
  if (problemDepth > 60) score += 5;
  if (solutionDepth > 60) score += 5;
  if (hasCompetitors) score += 4;
  if (category === "FOOD" || category === "RETAIL_LOCAL") score += 3;

  const nameHash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  score = (score + (nameHash % 12)) - 5;
  score = Math.min(94, Math.max(55, score));

  const marketScore = Math.min(98, score + 4);
  const problemScore = Math.min(95, score + 2);
  const solutionScore = Math.min(92, score - 2);
  const competitionScore = hasCompetitors ? 68 : 82;
  const businessModelScore = Math.min(90, score + 1);

  // Industry-specific next steps
  let customNextSteps: string[] = [];
  if (category === "FOOD") {
    customNextSteps = [
      "Select a high-footfall location near transit hubs or commercial markets",
      "Standardize recipes and taste consistency to ensure identical daily quality",
      "Secure required food licenses (FSSAI/Local permits) and GST registration",
      "Partner with local food delivery platforms (Zomato/Swiggy) for online orders",
      "Calculate unit economics: keep raw material costs below 30-35% of retail price",
    ];
  } else if (category === "FASHION") {
    customNextSteps = [
      "Source fabrics directly from garment mills to control per-piece cost",
      "Produce initial sample batch to test fit, stitching, and material quality",
      "Launch Instagram/TikTok lifestyle content and influencer seeding campaigns",
      "Offer clear size guides and return policies to keep returns under 10%",
      "Analyze gross margins and establish wholesale or D2C pricing tiers",
    ];
  } else if (category === "FITNESS") {
    customNextSteps = [
      "Finalize accessible location with ground floor access and parking",
      "Option for commercial equipment leasing to minimize initial CapEx",
      "Structure monthly, quarterly, and annual membership pricing tiers",
      "Hire certified trainers on performance-incentive arrangements",
      "Run pre-launch local promotion with free initial personal training sessions",
    ];
  } else if (category === "EDUCATION") {
    customNextSteps = [
      "Recruit subject-expert teachers with proven student track records",
      "Structure competitive monthly course fees and merit scholarships",
      "Equip classrooms with comfortable seating and digital learning tools",
      "Organize parent-teacher orientation sessions to build local trust",
      "Launch local word-of-mouth referral discounts for enrolled students",
    ];
  } else if (category === "RETAIL_LOCAL") {
    customNextSteps = [
      "Lease high-visibility store location in target shopping area",
      "Curate fast-moving inventory and display high-margin impulse items near checkout",
      "Negotiate 30-to-60 day credit payment terms with wholesale distributors",
      "Implement point-of-sale (POS) software for real-time stock tracking",
      "Launch customer loyalty phone-number reward program for repeat visits",
    ];
  } else {
    customNextSteps = [
      "Conduct 15-20 customer discovery interviews with target users",
      "Build a lightweight landing page or MVP prototype to validate conversion",
      "Establish early pricing tests to confirm willingness to pay",
      "Map out primary marketing acquisition channels (SEO, outbound, content)",
      "Set up key metrics analytics: CAC, LTV, conversion rates, and retention",
    ];
  }

  return {
    overallScore: score,
    marketPotential: {
      score: marketScore,
      summary: `High growth potential in ${input.country} targeting ${input.audience}.`,
      details: `The market for ${input.idea} shows strong customer demand in ${input.country}.`,
    },
    problemValidation: {
      score: problemScore,
      summary: "Clear pain point identified with high customer intent.",
      details: `The problem specified ("${input.problem.slice(0, 80)}...") represents a genuine friction point.`,
    },
    solutionQuality: {
      score: solutionScore,
      summary: "Strong product differentiation with actionable execution strategy.",
      details: `The proposed solution leverages targeted domain positioning tailored to ${input.audience}.`,
    },
    competitionLevel: {
      score: competitionScore,
      level: hasCompetitors ? "High" : "Medium",
      summary: hasCompetitors ? "Established competitors present; clear differentiation is vital." : "Moderate competitive landscape with space for a focused entrant.",
      details: input.competitors
        ? `Existing players (${input.competitors}) hold market share, requiring ${name} to focus heavily on unique value propositions.`
        : `No dominant monopoly identified, offering opportunity to capture early market share.`,
    },
    businessModel: {
      score: businessModelScore,
      summary: `Monetization via ${input.businessModel} provides scalable revenue potential.`,
      details: `The ${input.businessModel} strategy aligns well with customer expectations in this sector.`,
    },
    strengths: [
      `Well-defined target audience (${input.audience}) with urgent pain points`,
      `Scalable ${input.businessModel} model with strong unit economics potential`,
      `Clear initial geographic focus in ${input.country}`,
      `Distinct approach to solving ${input.problem.slice(0, 45)}...`,
    ],
    weaknesses: [
      "Initial customer acquisition cost might be high without referral loops",
      "Requires early customer validation to prove long-term retention",
      "Execution risk dependent on operational deployment quality",
    ],
    opportunities: [
      `Expand offering tailored specifically to ${input.audience}`,
      "Form strategic local partnerships and distribution channels",
      "Capitalize on emerging industry demand & customer trends",
      `Scale from ${input.country} into adjacent regional markets`,
    ],
    risks: [
      "Potential entry of incumbent competitors with existing footprint",
      "Customer churn if onboarding or service quality drops",
      "Regulatory or local municipal compliance in target market",
    ],
    nextSteps: customNextSteps,
    investorVerdict: `${name} demonstrates a compelling concept tackling a genuine pain point for ${input.audience}. With disciplined execution and domain-focused operations, this business has strong venture upside.`,
  };
}
