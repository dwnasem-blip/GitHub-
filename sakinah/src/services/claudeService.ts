import Anthropic from "@anthropic-ai/sdk";

export interface Step {
  stepNumber: number;
  title: string;
  description: string;
  explanation: string;
  keyConceptsText?: string;
  visualHint?: string;
}

export interface Solution {
  id: string;
  problemText: string;
  subject: string;
  steps: Step[];
  finalAnswer: string;
  estimatedTimeMinutes: number;
  clarityScore: number;
  model: string;
  cacheKey: string;
  generatedAt: string;
}

export interface GenerationRequest {
  problemText: string;
  subject?: string;
  userLevel?: "k_5" | "6_8" | "9_12" | "college" | "advanced";
  userTier?: "free" | "pro" | "premium";
}

// Subject-specific prompt templates
const SUBJECT_PROMPTS: Record<string, string> = {
  math: `You are an expert mathematics tutor. For each problem:
1. Identify the key mathematical concepts involved
2. Break down the solution into clear, numbered steps
3. Explain WHY each step works, not just HOW
4. Include relevant formulas or theorems
5. Provide a final answer with a sanity check

Format your response EXACTLY as JSON (no markdown, no code blocks):
{
  "subject": "mathematics",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Identify the Problem Type",
      "description": "What type of math problem is this?",
      "explanation": "Detailed explanation of this step",
      "keyConceptsText": "concept1, concept2",
      "visualHint": "Description of a helpful diagram"
    }
  ],
  "finalAnswer": "The answer is...",
  "estimatedTimeMinutes": 15,
  "clarityScore": 0.95
}`,

  science: `You are an expert science tutor (Physics, Chemistry, Biology). For each problem:
1. Identify the type of scientific concept (reaction, force, organism, etc.)
2. Show relevant equations or biological processes
3. Break into logical step-by-step solution
4. Connect to real-world applications or examples
5. Explain the underlying science

Format your response EXACTLY as JSON (no markdown, no code blocks):
{
  "subject": "science",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step Title",
      "description": "What we're solving",
      "explanation": "Scientific explanation",
      "keyConceptsText": "concepts",
      "visualHint": "diagram description"
    }
  ],
  "finalAnswer": "The result is...",
  "estimatedTimeMinutes": 20,
  "clarityScore": 0.90
}`,

  history: `You are an expert history tutor. For each historical question:
1. Provide historical context (time period, place, key figures)
2. Break down the causes, events, and consequences
3. Connect to broader historical themes
4. Include dates and important names
5. Explain historical significance

Format your response EXACTLY as JSON (no markdown, no code blocks):
{
  "subject": "history",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Historical Context",
      "description": "Understanding the background",
      "explanation": "Detailed context explanation",
      "keyConceptsText": "themes, periods, figures",
      "visualHint": "timeline or map description"
    }
  ],
  "finalAnswer": "The historical significance is...",
  "estimatedTimeMinutes": 25,
  "clarityScore": 0.88
}`,

  default: `You are an expert tutor across all subjects. For the given problem:
1. Identify what subject/topic this is
2. Break down the solution into clear, numbered steps
3. Explain the reasoning behind each step
4. Include key concepts and formulas where applicable
5. Provide a comprehensive final answer

Format your response EXACTLY as JSON (no markdown, no code blocks):
{
  "subject": "general",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step Title",
      "description": "What this step does",
      "explanation": "Detailed explanation",
      "keyConceptsText": "relevant concepts",
      "visualHint": "visual aid description"
    }
  ],
  "finalAnswer": "The answer is...",
  "estimatedTimeMinutes": 20,
  "clarityScore": 0.85
}`,
};

// Model selection based on user tier and complexity
function selectModel(
  userTier: string = "free",
  complexity: "simple" | "moderate" | "complex" = "moderate"
): string {
  if (userTier === "free" || complexity === "simple") {
    return "claude-3-5-haiku-20241022"; // Faster, cheaper
  }
  if (userTier === "pro" && complexity === "moderate") {
    return "claude-3-5-haiku-20241022";
  }
  return "claude-3-5-sonnet-20241022"; // Most capable for premium
}

// Detect subject from problem text
function detectSubject(problemText: string): string {
  const lowerText = problemText.toLowerCase();

  if (
    /\b(algebra|calculus|geometry|trigonometry|derivative|integral|equation|solve for)\b/.test(
      lowerText
    )
  ) {
    return "math";
  }
  if (
    /\b(physics|chemistry|biology|reaction|force|atom|element|organism|cell)\b/.test(
      lowerText
    )
  ) {
    return "science";
  }
  if (
    /\b(history|historical|war|revolution|century|king|queen|empire|civilization)\b/.test(
      lowerText
    )
  ) {
    return "history";
  }
  if (/\b(language|grammar|vocabulary|sentence|essay|literature|poem|novel)\b/.test(lowerText)) {
    return "language";
  }

  return "default";
}

// Generate SHA256 cache key
async function generateCacheKey(problemText: string, subject: string): Promise<string> {
  const combined = `${problemText}|${subject}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Main Claude service
export class ClaudeService {
  private client: Anthropic;
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.anthropic.com/v1";
    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  /**
   * Generate step-by-step solution for a problem
   */
  async generateSolution(request: GenerationRequest): Promise<Solution> {
    try {
      // Detect subject if not provided
      const subject = request.subject || detectSubject(request.problemText);

      // Generate cache key
      const cacheKey = await generateCacheKey(request.problemText, subject);

      // Select appropriate model
      const model = selectModel(request.userTier, "moderate");

      // Get subject-specific prompt
      const systemPrompt = SUBJECT_PROMPTS[subject] || SUBJECT_PROMPTS.default;

      // Call Claude API
      const message = await this.client.messages.create({
        model: model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Problem to solve:\n\n${request.problemText}`,
          },
        ],
      });

      // Extract text content
      const responseText =
        message.content[0].type === "text" ? message.content[0].text : "";

      // Parse JSON response
      let parsedResponse: any;
      try {
        // Try to find JSON in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse Claude response:", responseText);
        throw new Error("Failed to parse solution from Claude API");
      }

      // Build solution object
      const solution: Solution = {
        id: `sol_${Date.now()}`,
        problemText: request.problemText,
        subject: subject,
        steps: parsedResponse.steps || [],
        finalAnswer: parsedResponse.finalAnswer || "Solution generated",
        estimatedTimeMinutes: parsedResponse.estimatedTimeMinutes || 15,
        clarityScore: parsedResponse.clarityScore || 0.85,
        model: model,
        cacheKey: cacheKey,
        generatedAt: new Date().toISOString(),
      };

      return solution;
    } catch (error) {
      console.error("Error generating solution:", error);
      throw error;
    }
  }

  /**
   * Generate quiz questions from a solution
   */
  async generateQuizQuestions(
    solution: Solution,
    questionCount: number = 10
  ): Promise<any[]> {
    try {
      const model = selectModel("pro", "moderate");

      const prompt = `Based on this solution, generate ${questionCount} quiz questions:

Problem: ${solution.problemText}
Solution Steps: ${JSON.stringify(solution.steps)}
Final Answer: ${solution.finalAnswer}

Create questions in this format:
- 30% recall questions (do you understand step X?)
- 40% application questions (apply this to a new problem)
- 30% analysis questions (what if we changed this?)

Each question should have 4 multiple choice options with one correct answer.

Return as JSON array: [
  {
    "questionNumber": 1,
    "type": "recall|application|analysis",
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "Why this is correct"
  }
]`;

      const message = await this.client.messages.create({
        model: model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const responseText =
        message.content[0].type === "text" ? message.content[0].text : "";

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in quiz response");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error generating quiz questions:", error);
      throw error;
    }
  }

  /**
   * Generate social media content from a solution (Phase 2)
   */
  async generateSocialContent(
    solution: Solution,
    platform: "instagram" | "tiktok" | "twitter" | "youtube",
    audience: "students" | "educators" | "parents" = "students"
  ): Promise<any> {
    try {
      const model = selectModel("pro", "moderate");

      const prompts: Record<string, string> = {
        instagram: `Create an Instagram caption (max 2200 chars) explaining this concept:
Solution: ${solution.finalAnswer}
Target: ${audience}
Include: #education #learning hashtags, engaging tone, call-to-action`,

        tiktok: `Create a TikTok video script (30-60 seconds) explaining:
Solution: ${solution.finalAnswer}
Target: ${audience}
Include: hook, main idea, quick tips, engaging ending`,

        twitter: `Create a Twitter thread (5-7 tweets) about:
Solution: ${solution.finalAnswer}
Each tweet max 280 chars, educational and engaging`,

        youtube: `Create a YouTube video outline:
Problem: ${solution.problemText}
Solution: ${solution.finalAnswer}
Include: title, thumbnail idea, sections, duration estimate`,
      };

      const prompt = prompts[platform];

      const message = await this.client.messages.create({
        model: model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return {
        platform: platform,
        content:
          message.content[0].type === "text"
            ? message.content[0].text
            : "Content generation failed",
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating social content:", error);
      throw error;
    }
  }
}

// Export singleton instance creator
export function createClaudeService(apiKey: string): ClaudeService {
  return new ClaudeService(apiKey);
}
