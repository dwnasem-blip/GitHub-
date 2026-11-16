/**
 * Tutoring App Configuration
 * Environment variables and constants for the tutoring system
 */

// API Keys (from environment)
export const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY || "";
export const GOOGLE_VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || "";

// API Endpoints
export const API_ENDPOINTS = {
  claude: "https://api.anthropic.com/v1",
  googleVision: "https://vision.googleapis.com/v1/images:annotate",
};

// Model Configuration
export const CLAUDE_MODELS = {
  haiku: "claude-3-5-haiku-20241022", // Faster, cheaper for MVP
  sonnet: "claude-3-5-sonnet-20241022", // More capable
};

// OCR Configuration
export const OCR_CONFIG = {
  provider: "google-vision" as const,
  maxImageSize: 20 * 1024 * 1024, // 20MB
  supportedLanguages: ["ar", "en"],
  features: ["DOCUMENT_TEXT_DETECTION", "LABEL_DETECTION"],
};

// Subscription Configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    problemsPerMonth: 20,
    solutionsPerMonth: 20,
    quizzesPerMonth: 10,
    quizAttemptsPerMonth: 50,
    contentPiecesPerMonth: 0,
    maxSolutionQuality: "basic" as const,
    supportAdFree: false,
    contentGenerationEnabled: false,
    prioritySupport: false,
  },
  pro: {
    name: "Pro",
    problemsPerMonth: 500,
    solutionsPerMonth: 500,
    quizzesPerMonth: 100,
    quizAttemptsPerMonth: 1000,
    contentPiecesPerMonth: 0,
    maxSolutionQuality: "detailed" as const,
    supportAdFree: true,
    contentGenerationEnabled: false,
    prioritySupport: false,
  },
  premium: {
    name: "Premium",
    problemsPerMonth: 10000,
    solutionsPerMonth: 10000,
    quizzesPerMonth: 1000,
    quizAttemptsPerMonth: 10000,
    contentPiecesPerMonth: 100,
    maxSolutionQuality: "premium" as const,
    supportAdFree: true,
    contentGenerationEnabled: true,
    prioritySupport: true,
  },
};

// Quiz Configuration
export const QUIZ_CONFIG = {
  defaultQuestionCount: 10,
  defaultDifficulty: "medium" as const,
  timePerQuestion: 90, // seconds
  strategyDistribution: {
    recall: 0.3, // 30%
    application: 0.4, // 40%
    analysis: 0.3, // 30%
  },
  difficultyScaling: {
    easyPassThreshold: 0.5,
    mediumPassThreshold: 0.7,
    hardPassThreshold: 0.85,
    upThreshold: 0.85,
    downThreshold: 0.65,
  },
};

// Subject Configuration
export const SUBJECTS = {
  math: { name: "Mathematics", icon: "📐", color: "#FF6B6B" },
  science: { name: "Science", icon: "🔬", color: "#4ECDC4" },
  history: { name: "History", icon: "📚", color: "#95E1D3" },
  language: { name: "Language", icon: "🗣️", color: "#FFD93D" },
  geography: { name: "Geography", icon: "🌍", color: "#6BCB77" },
  general: { name: "General", icon: "💡", color: "#A8D8EA" },
};

// User Level Configuration
export const USER_LEVELS = {
  k_5: { name: "K-5", description: "Elementary School" },
  "6_8": { name: "6-8", description: "Middle School" },
  "9_12": { name: "9-12", description: "High School" },
  college: { name: "College", description: "University" },
  advanced: { name: "Advanced", description: "Professional/Lifelong Learning" },
};

// Learning Styles
export const LEARNING_STYLES = {
  visual: "Visual (diagrams, charts, images)",
  kinesthetic: "Kinesthetic (hands-on, practice)",
  auditory: "Auditory (explanations, discussions)",
  reading: "Reading/Writing (notes, summaries)",
};

// Cost Configuration (for reference)
export const API_COSTS = {
  claude: {
    haiku: {
      input: 0.8 / 1000000, // $0.80 per 1M input tokens
      output: 2.4 / 1000000, // $2.40 per 1M output tokens
    },
    sonnet: {
      input: 3 / 1000000, // $3 per 1M input tokens
      output: 15 / 1000000, // $15 per 1M output tokens
    },
  },
  googleVision: 1.5 / 1000, // $1.50 per 1000 images
};

// Rate Limiting Configuration
export const RATE_LIMITS = {
  free: {
    ocrPerMinute: 2,
    solutionPerMinute: 1,
    quizPerHour: 5,
  },
  pro: {
    ocrPerMinute: 10,
    solutionPerMinute: 5,
    quizPerHour: 20,
  },
  premium: {
    ocrPerMinute: 100,
    solutionPerMinute: 50,
    quizPerHour: 100,
  },
};

// Caching Configuration
export const CACHE_CONFIG = {
  solutionTTL: 86400 * 30, // 30 days in seconds
  quizTTL: 86400 * 7, // 7 days
  ocrResultTTL: 86400 * 60, // 60 days
  contentGenerationTTL: 86400 * 30, // 30 days
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableOCR: true,
  enableClaudeIntegration: true,
  enableQuizGeneration: true,
  enableContentGeneration: false, // Phase 2
  enableAnalytics: true,
  enableNotifications: true,
};

// Storage Configuration
export const STORAGE_CONFIG = {
  maxImageSizeCompressed: 1200, // pixels width
  imageCompressionFormat: "webp" as const,
  imageCompressionQuality: 0.85,
  buckets: {
    problemImages: "problem-images",
    solutionAssets: "solution-assets",
    userAvatars: "user-avatars",
    generatedContent: "generated-content",
  },
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  trackOCRAccuracy: true,
  trackSolutionQuality: true,
  trackUserEngagement: true,
  trackAPILatency: true,
  trackErrorRates: true,
};

// Validation Rules
export const VALIDATION_RULES = {
  ocrMinConfidence: 0.7,
  solutionMinLength: 100, // characters
  questionMinLength: 20, // characters
  textMaxLength: 50000, // characters
  imageMinDimensions: { width: 300, height: 300 },
};

// Default Values
export const DEFAULTS = {
  language: "ar" as const,
  userLevel: "9_12" as const,
  learningStyle: "visual" as const,
  subscriptionTier: "free" as const,
  difficulty: "medium" as const,
  quizQuestionCount: 10,
  timePerQuestion: 90, // seconds
};

// Error Messages
export const ERROR_MESSAGES = {
  OCR_FAILED: "Failed to extract text from image",
  OCR_LOW_CONFIDENCE: "Text extraction confidence too low",
  SOLUTION_GENERATION_FAILED: "Failed to generate solution",
  QUIZ_GENERATION_FAILED: "Failed to generate quiz",
  API_KEY_MISSING: "API key not configured",
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded. Please try again later.",
  SUBSCRIPTION_LIMIT_EXCEEDED: "Monthly usage limit exceeded",
  INVALID_IMAGE: "Invalid image file",
  NETWORK_ERROR: "Network error. Please check your connection.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  OCR_COMPLETE: "Text extracted successfully",
  SOLUTION_GENERATED: "Solution generated successfully",
  QUIZ_GENERATED: "Quiz created successfully",
  SUBSCRIPTION_UPDATED: "Subscription updated successfully",
};

// Environment Check
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!CLAUDE_API_KEY) {
    errors.push("EXPO_PUBLIC_CLAUDE_API_KEY not set");
  }

  if (!GOOGLE_VISION_API_KEY) {
    errors.push("EXPO_PUBLIC_GOOGLE_VISION_API_KEY not set");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  CLAUDE_API_KEY,
  GOOGLE_VISION_API_KEY,
  API_ENDPOINTS,
  CLAUDE_MODELS,
  OCR_CONFIG,
  SUBSCRIPTION_TIERS,
  QUIZ_CONFIG,
  SUBJECTS,
  USER_LEVELS,
  LEARNING_STYLES,
  API_COSTS,
  RATE_LIMITS,
  CACHE_CONFIG,
  FEATURE_FLAGS,
  STORAGE_CONFIG,
  ANALYTICS_CONFIG,
  VALIDATION_RULES,
  DEFAULTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  validateEnvironment,
};
