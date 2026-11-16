import { ClaudeService } from "./claudeService";

export interface QuizQuestion {
  id: string;
  questionNumber: number;
  type: "multiple_choice" | "fill_blank" | "true_false" | "short_answer";
  stepRelation?: string; // Which solution step does this relate to?
  strategy: "recall" | "application" | "analysis";
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  options?: Array<{
    id: string;
    text: string;
  }>;
  correctAnswerId?: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  solutionId: string;
  title: string;
  description?: string;
  questionCount: number;
  difficulty: "easy" | "medium" | "hard";
  estimatedTimeMinutes: number;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  responses: QuizResponse[];
  performanceInsights?: PerformanceInsight;
}

export interface QuizResponse {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  confidenceLevel?: number; // 1-5 scale
}

export interface PerformanceInsight {
  weakAreas: string[];
  strongAreas: string[];
  recommendedNextSteps: string[];
  pattern: "consistent" | "improving" | "declining";
}

export class QuizGenerationService {
  private claudeService: ClaudeService;

  constructor(claudeService: ClaudeService) {
    this.claudeService = claudeService;
  }

  /**
   * Generate a complete quiz from a solution
   */
  async generateQuiz(params: {
    solutionId: string;
    problemText: string;
    solutionText: string;
    solutionSteps: any[];
    questionCount?: number;
    difficulty?: "easy" | "medium" | "hard";
    userTier?: "free" | "pro" | "premium";
  }): Promise<Quiz> {
    try {
      const questionCount = params.questionCount || 10;
      const difficulty = params.difficulty || "medium";

      // Calculate strategy distribution
      const strategies = this.calculateStrategyDistribution(questionCount);

      // Generate questions using Claude
      const questions = await this.generateQuestionsWithStrategies(
        {
          problemText: params.problemText,
          solutionText: params.solutionText,
          solutionSteps: params.solutionSteps,
        },
        strategies
      );

      // Build quiz object
      const quiz: Quiz = {
        id: `quiz_${Date.now()}`,
        solutionId: params.solutionId,
        title: `Quiz: ${params.problemText.substring(0, 50)}...`,
        questionCount: questions.length,
        difficulty: difficulty,
        estimatedTimeMinutes: this.estimateQuizTime(questions),
        questions: questions,
        createdAt: new Date().toISOString(),
      };

      return quiz;
    } catch (error) {
      console.error("Error generating quiz:", error);
      throw error;
    }
  }

  /**
   * Calculate strategy distribution for balanced questions
   * 30% Recall, 40% Application, 30% Analysis
   */
  private calculateStrategyDistribution(
    total: number
  ): Record<"recall" | "application" | "analysis", number> {
    return {
      recall: Math.ceil(total * 0.3),
      application: Math.ceil(total * 0.4),
      analysis: Math.ceil(total * 0.3),
    };
  }

  /**
   * Generate questions using different strategies
   */
  private async generateQuestionsWithStrategies(
    context: {
      problemText: string;
      solutionText: string;
      solutionSteps: any[];
    },
    strategies: Record<"recall" | "application" | "analysis", number>
  ): Promise<QuizQuestion[]> {
    const questions: QuizQuestion[] = [];
    let questionNumber = 1;

    // Generate Recall Questions (30%)
    const recallQuestions = await this.generateRecallQuestions(
      context,
      strategies.recall
    );
    questions.push(
      ...recallQuestions.map((q, i) => ({
        ...q,
        questionNumber: questionNumber++,
      }))
    );

    // Generate Application Questions (40%)
    const appQuestions = await this.generateApplicationQuestions(
      context,
      strategies.application
    );
    questions.push(
      ...appQuestions.map((q, i) => ({
        ...q,
        questionNumber: questionNumber++,
      }))
    );

    // Generate Analysis Questions (30%)
    const analysisQuestions = await this.generateAnalysisQuestions(
      context,
      strategies.analysis
    );
    questions.push(
      ...analysisQuestions.map((q, i) => ({
        ...q,
        questionNumber: questionNumber++,
      }))
    );

    return questions;
  }

  /**
   * Generate recall questions (do you remember this concept?)
   */
  private async generateRecallQuestions(
    context: {
      problemText: string;
      solutionText: string;
      solutionSteps: any[];
    },
    count: number
  ): Promise<QuizQuestion[]> {
    const prompts = context.solutionSteps.slice(0, count).map((step, i) => ({
      stepNumber: i + 1,
      prompt: `Generate a recall question about this concept: "${step.title}"

      Context: ${step.explanation}

      Create a multiple choice question with 4 options. Return as JSON:
      {
        "question": "What is...",
        "options": [{"id": "A", "text": "..."}, ...],
        "correctId": "A",
        "explanation": "Because..."
      }`,
    }));

    // Generate using Claude (batch if possible)
    const questions: QuizQuestion[] = [];

    for (const { stepNumber, prompt } of prompts) {
      try {
        // In production, would batch these for efficiency
        const response = await this.queryClaudeForQuestion(prompt);

        questions.push({
          id: `q_recall_${stepNumber}`,
          type: "multiple_choice",
          strategy: "recall",
          difficulty: "easy",
          stepRelation: `step_${stepNumber}`,
          questionNumber: 0, // Will be set later
          questionText: response.question,
          options: response.options,
          correctAnswerId: response.correctId,
          explanation: response.explanation,
        });
      } catch (error) {
        console.warn(`Failed to generate recall question ${stepNumber}:`, error);
      }
    }

    return questions;
  }

  /**
   * Generate application questions (apply this to a new problem)
   */
  private async generateApplicationQuestions(
    context: {
      problemText: string;
      solutionText: string;
      solutionSteps: any[];
    },
    count: number
  ): Promise<QuizQuestion[]> {
    const prompt = `Given this problem and solution:

Problem: ${context.problemText}
Solution: ${context.solutionText}

Generate ${count} application questions that require students to:
1. Apply the same method to a NEW problem with different numbers/context
2. Modify one parameter and predict the outcome
3. Solve a related but slightly different problem

Each question should have 4 multiple choice options.

Return as JSON array:
[
  {
    "question": "If we changed X to Y, what would happen?",
    "options": [{"id": "A", "text": "..."}, ...],
    "correctId": "A",
    "explanation": "Because..."
  }
]`;

    try {
      const responses = await this.queryClaudeForMultipleQuestions(prompt, count);
      return responses.map((r, i) => ({
        id: `q_app_${i}`,
        type: "multiple_choice",
        strategy: "application",
        difficulty: "medium",
        questionNumber: 0,
        questionText: r.question,
        options: r.options,
        correctAnswerId: r.correctId,
        explanation: r.explanation,
      }));
    } catch (error) {
      console.error("Error generating application questions:", error);
      return [];
    }
  }

  /**
   * Generate analysis questions (why does this work?)
   */
  private async generateAnalysisQuestions(
    context: {
      problemText: string;
      solutionText: string;
      solutionSteps: any[];
    },
    count: number
  ): Promise<QuizQuestion[]> {
    const prompt = `Given this problem and solution:

Problem: ${context.problemText}
Solution: ${context.solutionText}

Generate ${count} analysis/synthesis questions that require deep understanding:
1. "Why" questions - why does this method work?
2. "What if" questions - how would the solution change?
3. Comparison questions - how does this relate to other concepts?
4. Extension questions - how could we generalize this?

Each question should have 4 multiple choice options and require critical thinking.

Return as JSON array:
[
  {
    "question": "Why does this step work?",
    "options": [{"id": "A", "text": "..."}, ...],
    "correctId": "A",
    "explanation": "Because..."
  }
]`;

    try {
      const responses = await this.queryClaudeForMultipleQuestions(prompt, count);
      return responses.map((r, i) => ({
        id: `q_analysis_${i}`,
        type: "multiple_choice",
        strategy: "analysis",
        difficulty: "hard",
        questionNumber: 0,
        questionText: r.question,
        options: r.options,
        correctAnswerId: r.correctId,
        explanation: r.explanation,
      }));
    } catch (error) {
      console.error("Error generating analysis questions:", error);
      return [];
    }
  }

  /**
   * Query Claude for a single question
   */
  private async queryClaudeForQuestion(prompt: string): Promise<any> {
    // This would call claudeService.generateQuizQuestions
    // For now, return a mock response
    return {
      question: "Sample question?",
      options: [
        { id: "A", text: "Option A" },
        { id: "B", text: "Option B" },
        { id: "C", text: "Option C" },
        { id: "D", text: "Option D" },
      ],
      correctId: "A",
      explanation: "This is correct because...",
    };
  }

  /**
   * Query Claude for multiple questions
   */
  private async queryClaudeForMultipleQuestions(
    prompt: string,
    count: number
  ): Promise<any[]> {
    // This would call claudeService.generateQuizQuestions
    // For now, return mock responses
    return Array.from({ length: count }).map(() => ({
      question: "Sample question?",
      options: [
        { id: "A", text: "Option A" },
        { id: "B", text: "Option B" },
        { id: "C", text: "Option C" },
        { id: "D", text: "Option D" },
      ],
      correctId: "A",
      explanation: "This is correct because...",
    }));
  }

  /**
   * Estimate quiz time based on questions
   */
  private estimateQuizTime(questions: QuizQuestion[]): number {
    // Average: 1.5 minutes per question
    return Math.ceil(questions.length * 1.5);
  }

  /**
   * Calculate performance insights from attempt
   */
  calculatePerformanceInsights(attempt: QuizAttempt): PerformanceInsight {
    const correctResponses = attempt.responses.filter((r) => r.isCorrect).length;
    const accuracy = correctResponses / attempt.totalQuestions;

    // Find weak areas (wrong answers)
    const weakQuestions = attempt.responses
      .filter((r) => !r.isCorrect)
      .map((r) => r.questionId);

    // Find strong areas (correct answers)
    const strongQuestions = attempt.responses
      .filter((r) => r.isCorrect)
      .map((r) => r.questionId);

    // Determine pattern (needs more attempts to establish)
    const pattern: "consistent" | "improving" | "declining" = "consistent";

    // Generate recommendations
    const recommendations: string[] = [];
    if (accuracy < 0.5) {
      recommendations.push("Review the fundamental concepts");
      recommendations.push("Try another quiz with easier difficulty");
    } else if (accuracy < 0.75) {
      recommendations.push("Good progress! Try similar problems");
      recommendations.push("Focus on the weak areas identified");
    } else {
      recommendations.push("Excellent! You're ready for the next topic");
      recommendations.push("Try harder difficulty level");
    }

    return {
      weakAreas: weakQuestions,
      strongAreas: strongQuestions,
      recommendedNextSteps: recommendations,
      pattern: pattern,
    };
  }

  /**
   * Calculate recommended difficulty for next quiz
   */
  recommendNextDifficulty(attempt: QuizAttempt): "easy" | "medium" | "hard" {
    const correctResponses = attempt.responses.filter((r) => r.isCorrect).length;
    const accuracy = correctResponses / attempt.totalQuestions;
    const timeRatio = attempt.timeSpentSeconds / (this.estimateQuizTime([]) * 60); // Rough estimate

    if (accuracy > 0.85 && timeRatio < 0.9) {
      return "hard"; // Student is ready for more challenge
    }
    if (accuracy < 0.65) {
      return "easy"; // Need more practice at fundamentals
    }
    return "medium"; // Goldilocks zone
  }
}

/**
 * Create quiz generation service
 */
export function createQuizGenerationService(
  claudeService: ClaudeService
): QuizGenerationService {
  return new QuizGenerationService(claudeService);
}
