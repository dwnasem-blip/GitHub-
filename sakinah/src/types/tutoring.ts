// Tutoring app specific types

export type UserLevel = "k_5" | "6_8" | "9_12" | "college" | "advanced";
export type Subject =
  | "math"
  | "science"
  | "history"
  | "language"
  | "geography"
  | "general";
export type LearningStyle = "visual" | "kinesthetic" | "auditory" | "reading";
export type SubscriptionTier = "free" | "pro" | "premium";

export interface TutoringUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  gradeLevel: UserLevel;
  learningStyle: LearningStyle;
  favoriteSubjects: Subject[];
  language: "ar" | "en";
  createdAt: string;
  updatedAt: string;
}

export interface TutoringUserProfile {
  userId: string;
  gradeLevel: UserLevel;
  learningStyle: LearningStyle;
  bio?: string;
  preferences: {
    difficultyLevel: "easy" | "medium" | "hard";
    quizLength: number;
    timePerQuestion: number;
  };
}

export interface SubscriptionInfo {
  userId: string;
  tier: SubscriptionTier;
  status: "active" | "cancelled" | "expired";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usageThisMonth: {
    problemsAnalyzed: number;
    solutionsGenerated: number;
    quizzesCreated: number;
    quizAttemptsCompleted: number;
    contentPiecesGenerated: number;
  };
}

export interface UsageLimits {
  tier: SubscriptionTier;
  problemsPerMonth: number;
  solutionsPerMonth: number;
  quizzesPerMonth: number;
  quizAttemptsPerMonth: number;
  contentPiecesPerMonth: number;
  maxSolutionQuality: "basic" | "detailed" | "premium";
  supportAdFree: boolean;
  contentGenerationEnabled: boolean;
  prioritySupport: boolean;
}

export interface LearningMetrics {
  userId: string;
  totalProblemasSolved: number;
  totalQuizzesCompleted: number;
  averageAccuracy: number; // 0-100
  averageTimePerProblem: number; // seconds
  subjectMastery: Record<Subject, number>; // 0-100 score per subject
  lastActivityDate: string;
  streakDays: number;
  totalXP: number;
}

export interface ContentGeneration {
  id: string;
  solutionId: string;
  userId: string;
  contentType: "social_post" | "video_script" | "ad_concept";
  platform: "instagram" | "tiktok" | "youtube" | "twitter";
  language: "ar" | "en";
  content: string;
  metadata: {
    hashtags?: string[];
    captions?: string[];
    estimatedReach?: number;
    engagementHooks?: string[];
    duration?: string; // For videos
  };
  approvalStatus: "draft" | "approved" | "published";
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  actionType:
    | "problem_captured"
    | "solution_generated"
    | "quiz_completed"
    | "content_generated"
    | "subscription_changed"
    | "login"
    | "logout";
  metadata: Record<string, any>;
  createdAt: string;
}

export interface LearningRecommendation {
  userId: string;
  recommendationType: "next_topic" | "review_topic" | "challenge_topic";
  subject: Subject;
  topic: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard";
  priority: number; // 1-10
}

export interface NotificationPreferences {
  userId: string;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  dailyReminder: boolean;
  reminderTime?: string; // HH:MM format
  notifyOnStreakLoss: boolean;
  notifyOnAchievements: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  hasMore: boolean;
}

// Error types
export class TutoringError extends Error {
  code: string;
  httpStatus: number;
  details?: Record<string, any>;

  constructor(
    message: string,
    code: string = "TUTORING_ERROR",
    httpStatus: number = 500,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = "TutoringError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export class OCRError extends TutoringError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "OCR_ERROR", 400, details);
    this.name = "OCRError";
  }
}

export class SolutionGenerationError extends TutoringError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "SOLUTION_GENERATION_ERROR", 500, details);
    this.name = "SolutionGenerationError";
  }
}

export class QuizGenerationError extends TutoringError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "QUIZ_GENERATION_ERROR", 500, details);
    this.name = "QuizGenerationError";
  }
}

export class SubscriptionError extends TutoringError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "SUBSCRIPTION_ERROR", 403, details);
    this.name = "SubscriptionError";
  }
}
