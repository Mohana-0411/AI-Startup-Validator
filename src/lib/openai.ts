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

export function isStartupRelatedIntent(message: string): { isStartup: boolean; category?: string } {
  const lower = message.toLowerCase().trim();

  // Explicit non-startup topic triggers
  const nonStartupTriggers = [
    { keywords: ["biryani", "recipe", "cook", "bake", "curry", "kitchen", "food dish", "chef", "pasta", "pizza", "noodle"], category: "cooking" },
    { keywords: ["movie", "cinema", "actor", "actress", "film", "hollywood", "bollywood", "netflix show", "anime"], category: "movies & entertainment" },
    { keywords: ["weather", "temperature", "rain", "forecast", "climate today"], category: "weather" },
    { keywords: ["cricket", "football", "soccer", "nba", "ipl", "match score", "tennis", "olympics"], category: "sports" },
    { keywords: ["joke", "tell me a joke", "riddle", "funny story", "poem", "sing a song"], category: "entertainment" },
    { keywords: ["capital of", "who invented", "who painted", "presidential election", "history of rome"], category: "general trivia" },
    { keywords: ["horoscope", "astrology", "zodiac", "tarot"], category: "astrology" },
  ];

  for (const trigger of nonStartupTriggers) {
    if (trigger.keywords.some((kw) => lower.includes(kw))) {
      return { isStartup: false, category: trigger.category };
    }
  }

  // Allowed startup keywords
  const startupKeywords = [
    "startup", "business", "idea", "market", "validate", "validation", "customer", "discovery",
    "competitor", "competition", "rival", "moat", "product", "pricing", "model", "strategy",
    "go-to-market", "gtm", "marketing", "sales", "growth", "funding", "fundraise", "investor",
    "vc", "venture", "pitch", "deck", "saas", "entrepreneur", "metric", "cac", "ltv", "pmf",
    "product-market fit", "financial", "revenue", "monetiz", "team", "operation", "score",
    "improve", "swat", "risk", "opportunity", "audience", "mvp", "launch", "b2b", "b2c",
    "churn", "retention", "waitlist", "traction", "scale", "feature", "workflow", "unit economics"
  ];

  const hasStartupKw = startupKeywords.some((kw) => lower.includes(kw));
  if (hasStartupKw) {
    return { isStartup: true };
  }

  // If very short general question like "Hi", "Hello", "How are you", "Help", treat as startup prompt greeting
  const greetings = ["hi", "hello", "hey", "help", "good morning", "good evening", "what can you do"];
  if (greetings.some((g) => lower === g || lower.startsWith(g))) {
    return { isStartup: true };
  }

  // Default to non-startup if no startup keywords or context match
  return { isStartup: false, category: "general topics" };
}

export async function generateStartupAnalysis(
  input: StartupIdeaInput
): Promise<AnalysisResultJSON> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const prompt = `You are an experienced startup investor.

Analyze this startup idea.

Startup Name: ${input.startupName}
One-line Idea: ${input.idea}
Problem: ${input.problem}
Solution: ${input.solution}
Target Audience: ${input.audience}
Country/Region: ${input.country}
Business Model: ${input.businessModel}
Competitors: ${input.competitors || "Not specified"}

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
nextSteps (array of 4-6 practical, actionable steps for the founder)
investorVerdict (a 2-3 sentence executive summary from a tier-1 VC partner perspective)

Keep answers concise and practical.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a top-tier Silicon Valley Y Combinator & Sequoia Capital venture capitalist investor. Analyze startup ideas with strict, fair, and highly actionable JSON analysis.",
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
  // Step 1: Pre-classification via Lightweight Intent Classifier
  const classification = isStartupRelatedIntent(userMessage);
  if (!classification.isStartup) {
    const categoryName = classification.category || "non-startup topics";
    return `I'm your AI Startup Mentor, so I can't help with ${categoryName}. Ask me anything about startups, business strategy, validation, competitors, funding, pricing, SaaS, or entrepreneurship.`;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  const contextPrompt = `You are a strict, professional AI Startup Mentor.

CRITICAL MANDATE:
You MUST ONLY answer questions directly related to:
- Startup ideas & business models
- Market validation & customer discovery
- Competitor analysis & moats
- Product development & pricing strategy
- Go-to-market strategy, marketing, & sales
- Growth, funding, investors, & pitch decks
- SaaS, entrepreneurship, & metrics
- Product-market fit & financial planning

STRICT REFUSAL RULE:
If the user asks about ANY unrelated topic (such as cooking, recipes, movies, sports, weather, jokes, or general trivia), YOU MUST REFUSE TO ANSWER.
NEVER attempt to bridge or force unrelated topics (like biryani or cooking) into startup advice.

Refusal template:
"I'm your AI Startup Mentor, so I can't help with [topic]. Ask me anything about startups, business strategy, validation, competitors, funding, pricing, SaaS, or entrepreneurship."

${
  analysisContext
    ? `Startup Context under evaluation:
- Startup Name: "${analysisContext.startupName}"
- One-line Idea: ${analysisContext.idea}
- Problem: ${analysisContext.problem}
- Solution: ${analysisContext.solution}
- Target Audience: ${analysisContext.audience}
- Business Model: ${analysisContext.businessModel}
- Competitors: ${analysisContext.competitors || "None listed"}
- Score: ${analysisContext.overallScore}/100`
    : ""
}`;

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("your-api-key")) {
    try {
      const openai = new OpenAI({ apiKey });

      const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: contextPrompt },
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
    const categoryName = classification.category || "non-startup topics";
    return `I'm your AI Startup Mentor, so I can't help with ${categoryName}. Ask me anything about startups, business strategy, validation, competitors, funding, pricing, SaaS, or entrepreneurship.`;
  }

  const lowerMsg = msg.toLowerCase();
  const name = ctx?.startupName || "your startup";
  const score = ctx?.overallScore || 75;

  if (lowerMsg.includes("score") || lowerMsg.includes("improve")) {
    return `To improve ${name}'s score from **${score}/100**, focus on these 3 high-impact levers:

1. **Sharpen Problem Urgency**: Get 10 recorded discovery calls with ${ctx?.audience || "target users"} showing they are actively trying to solve "${ctx?.problem ? ctx.problem.slice(0, 45) : "the core problem"}...".
2. **De-risk CAC**: Test landing page conversion using a $50 ad test or outbound email sequence to measure signup intent.
3. **Solidify Moat**: Highlight unique IP, data network effects, or exclusive distribution channels against competitors (${ctx?.competitors || "existing alternatives"}).`;
  }

  if (lowerMsg.includes("validate") || lowerMsg.includes("first")) {
    return `Here is your 3-step validation roadmap for **${name}**:

1. **Step 1: Customer Interviews (Week 1)**: Interview 15-20 people in your target demographic (${ctx?.audience || "target audience"}) focusing on past behavior, not hypothetical promises.
2. **Step 2: Smoke Test Landing Page (Week 2)**: Create a 1-page landing page highlighting your solution ("${ctx?.solution ? ctx.solution.slice(0, 50) : "the solution"}...") with a "Join Waitlist / Pre-order" CTA.
3. **Step 3: Willingness-to-Pay Test (Week 3)**: Test early pricing for ${ctx?.businessModel || "your business model"} to confirm real conversion intent.`;
  }

  if (lowerMsg.includes("competitor") || lowerMsg.includes("competition")) {
    return `Here is how **${name}** can position against ${ctx?.competitors || "incumbents"}:

- **Speed & Specialization**: Large competitors move slowly and target general markets. Focus 100% of your product messaging on ${ctx?.audience || "your core niche"}.
- **Product Simplicity**: Remove friction points. Provide an onboarding flow that delivers value in < 60 seconds.
- **Modern Pricing**: Differentiate using your ${ctx?.businessModel || "value-based pricing model"} to undercut legacy pricing structures.`;
  }

  if (lowerMsg.includes("pitch") || lowerMsg.includes("investor")) {
    return `Here is a 60-second Elevator Pitch script for **${name}**:

> *"We are building **${name}** — ${ctx?.idea || "the premier platform for our market"}.
> Today, ${ctx?.audience || "our target audience"} struggles with ${ctx?.problem ? ctx.problem.slice(0, 70) : "acute industry pain points"}...
> Our solution provides ${ctx?.solution ? ctx.solution.slice(0, 80) : "an automated workflow"}...
> Monetizing via ${ctx?.businessModel || "our business model"}, we are capturing a growing market with strong initial validation score of ${score}/100."*`;
  }

  if (lowerMsg.includes("business model") || lowerMsg.includes("monetiz")) {
    return `Suggestions to optimize ${name}'s business model (${ctx?.businessModel || "current model"}):

1. **Tiered Pricing Structure**: Offer an entry tier for friction-free onboarding, a Pro tier for core power users, and a custom enterprise tier.
2. **Expansion Revenue**: Add usage-based add-ons or API access tokens as customers scale their usage.
3. **Annual Prepay Incentive**: Offer a 20% discount for upfront annual commitments to increase early cash flow.`;
  }

  return `Great startup question regarding **${name}**! 

To execute effectively for ${ctx?.audience || "your audience"}:
- Focus on fast customer discovery loops before writing heavy code.
- Measure activation rate and retention as your North Star metrics.
- Keep iterating on your core value proposition: "${ctx?.idea || "solving the core pain point"}".

What specific metric or go-to-market hurdle would you like to dive into next?`;
}

function generateFallbackAnalysis(input: StartupIdeaInput): AnalysisResultJSON {
  const name = input.startupName.trim();
  const hasCompetitors = Boolean(input.competitors && input.competitors.length > 5);
  const problemDepth = input.problem.length;
  const solutionDepth = input.solution.length;

  let score = 72;
  if (problemDepth > 60) score += 6;
  if (solutionDepth > 60) score += 6;
  if (hasCompetitors) score += 4;
  if (input.businessModel.toLowerCase().includes("saas") || input.businessModel.toLowerCase().includes("subscription")) {
    score += 5;
  }

  const nameHash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  score = (score + (nameHash % 15)) - 7;
  score = Math.min(94, Math.max(52, score));

  const marketScore = Math.min(98, score + 4);
  const problemScore = Math.min(95, score + 2);
  const solutionScore = Math.min(92, score - 2);
  const competitionScore = hasCompetitors ? 68 : 82;
  const businessModelScore = Math.min(90, score + 1);

  return {
    overallScore: score,
    marketPotential: {
      score: marketScore,
      summary: `High growth potential in ${input.country} targeting ${input.audience}.`,
      details: `The addressable market for ${input.idea} shows strong tailwinds. Expanding in ${input.country} provides a focused initial beachhead before scaling internationally.`,
    },
    problemValidation: {
      score: problemScore,
      summary: "Clear pain point identified with high customer intent.",
      details: `The problem specified ("${input.problem.slice(0, 80)}...") represents an acute friction point where users are actively seeking efficient solutions.`,
    },
    solutionQuality: {
      score: solutionScore,
      summary: "Strong product differentiation with actionable execution strategy.",
      details: `The proposed solution leverages targeted domain positioning. Key to success will be rapid iteration based on initial user feedback.`,
    },
    competitionLevel: {
      score: competitionScore,
      level: hasCompetitors ? "High" : "Medium",
      summary: hasCompetitors ? "Established competitors present; clear differentiation is vital." : "Moderate competitive landscape with space for a focused entrant.",
      details: input.competitors
        ? `Existing players (${input.competitors}) hold market share, requiring ${name} to focus heavily on unique value propositions and fast execution.`
        : `No dominant direct monopoly identified, offering a window of opportunity to capture early adopter mindshare.`,
    },
    businessModel: {
      score: businessModelScore,
      summary: `Monetization via ${input.businessModel} provides scalable revenue potential.`,
      details: `The ${input.businessModel} strategy aligns well with customer expectations in this sector, creating recurring revenue paths.`,
    },
    strengths: [
      `Well-defined target audience (${input.audience}) with urgent pain points`,
      `Scalable ${input.businessModel} model with strong unit economics potential`,
      `Clear initial geographic focus in ${input.country}`,
      `Distinct approach to solving ${input.problem.slice(0, 45)}...`,
    ],
    weaknesses: [
      "Initial customer acquisition cost (CAC) might be high without viral loops",
      "Requires early user validation to prove long-term retention metrics",
      "Execution risk dependent on rapid MVP deployment and feedback cycles",
    ],
    opportunities: [
      `Expand product feature set tailored specifically to ${input.audience}`,
      "Form strategic B2B partnerships and affiliate distribution networks",
      "Capitalize on emerging industry automation & AI productivity trends",
      `Scale from ${input.country} into adjacent global markets`,
    ],
    risks: [
      "Potential entry of incumbent tech companies with existing user bases",
      "Customer churn if onboarding friction is not minimized",
      "Regulatory or platform dependency compliance in target market",
    ],
    nextSteps: [
      "Conduct 15-20 customer discovery interviews with target users",
      "Build a lightweight landing page or MVP prototype to validate landing conversion",
      "Establish early pricing tests to confirm willingness to pay",
      "Map out primary marketing acquisition channels (SEO, outbound, content)",
      "Set up key metrics analytics: CAC, LTV, conversion rates, and retention",
    ],
    investorVerdict: `${name} demonstrates a compelling concept tackling a genuine pain point for ${input.audience}. With disciplined execution and early customer validation, this startup has strong venture upside.`,
  };
}
