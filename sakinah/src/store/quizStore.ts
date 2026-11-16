import { create } from "zustand";
import {
  Quiz,
  QuizAttempt,
  QuizResponse,
  PerformanceInsight,
  QuizQuestion,
} from "@services/quizGenerationService";

export interface QuizState {
  // Active quiz session
  currentQuiz: Quiz | null;
  currentAttempt: QuizAttempt | null;
  currentQuestionIndex: number;

  // Quiz history
  quizHistory: QuizAttempt[];
  completedQuizzes: Quiz[];

  // Session state
  sessionResponses: QuizResponse[];
  isQuizActive: boolean;
  isQuizGenerating: boolean;
  quizError: string | null;

  // Actions
  setCurrentQuiz: (quiz: Quiz) => void;
  startQuizSession: (quiz: Quiz, userId: string) => void;
  answerQuestion: (questionId: string, answer: string, timeSpent: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  completeQuiz: (attempt: QuizAttempt) => void;

  getCurrentQuestion: () => QuizQuestion | null;
  getQuestionProgress: () => { current: number; total: number };
  getSessionScore: () => number;
  getSessionAccuracy: () => number;

  setQuizGenerating: (loading: boolean) => void;
  setQuizError: (error: string | null) => void;

  clearSession: () => void;
  getQuizHistory: () => QuizAttempt[];
}

export const useQuizStore = create<QuizState>((set, get) => ({
  // Initial state
  currentQuiz: null,
  currentAttempt: null,
  currentQuestionIndex: 0,
  quizHistory: [],
  completedQuizzes: [],
  sessionResponses: [],
  isQuizActive: false,
  isQuizGenerating: false,
  quizError: null,

  // Quiz actions
  setCurrentQuiz: (quiz: Quiz) => {
    set({ currentQuiz: quiz, quizError: null });
  },

  startQuizSession: (quiz: Quiz, userId: string) => {
    const attempt: QuizAttempt = {
      id: `attempt_${Date.now()}`,
      quizId: quiz.id,
      userId: userId,
      startedAt: new Date().toISOString(),
      score: 0,
      totalQuestions: quiz.questionCount,
      timeSpentSeconds: 0,
      responses: [],
    };

    set({
      currentQuiz: quiz,
      currentAttempt: attempt,
      currentQuestionIndex: 0,
      sessionResponses: [],
      isQuizActive: true,
      quizError: null,
    });
  },

  answerQuestion: (questionId: string, answer: string, timeSpent: number) => {
    set((state) => {
      const quiz = state.currentQuiz;
      if (!quiz) return state;

      const question = quiz.questions.find((q) => q.id === questionId);
      if (!question) return state;

      const isCorrect = question.correctAnswerId === answer;

      return {
        sessionResponses: [
          ...state.sessionResponses,
          {
            questionId,
            userAnswer: answer,
            isCorrect,
            timeSpentSeconds: timeSpent,
          },
        ],
      };
    });
  },

  nextQuestion: () => {
    set((state) => {
      if (!state.currentQuiz) return state;

      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex < state.currentQuiz.questionCount) {
        return { currentQuestionIndex: nextIndex };
      }

      return state; // Stay on last question
    });
  },

  previousQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex > 0) {
        return { currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return state;
    });
  },

  submitQuiz: () => {
    set((state) => {
      const quiz = state.currentQuiz;
      const responses = state.sessionResponses;

      if (!quiz || !state.currentAttempt) return state;

      // Calculate score
      const correctCount = responses.filter((r) => r.isCorrect).length;
      const score = Math.round((correctCount / quiz.questionCount) * 100);

      // Calculate time spent
      const timeSpent = responses.reduce((sum, r) => sum + r.timeSpentSeconds, 0);

      const completedAttempt: QuizAttempt = {
        ...state.currentAttempt,
        completedAt: new Date().toISOString(),
        score: score,
        timeSpentSeconds: timeSpent,
        responses: responses,
      };

      return {
        currentAttempt: completedAttempt,
        isQuizActive: false,
      };
    });
  },

  completeQuiz: (attempt: QuizAttempt) => {
    set((state) => ({
      quizHistory: [attempt, ...state.quizHistory],
      completedQuizzes: state.currentQuiz
        ? [state.currentQuiz, ...state.completedQuizzes]
        : state.completedQuizzes,
      currentQuiz: null,
      currentAttempt: null,
      sessionResponses: [],
      isQuizActive: false,
    }));
  },

  // Query actions
  getCurrentQuestion: () => {
    const state = get();
    const quiz = state.currentQuiz;

    if (!quiz || state.currentQuestionIndex >= quiz.questionCount) {
      return null;
    }

    return quiz.questions[state.currentQuestionIndex] || null;
  },

  getQuestionProgress: () => {
    const state = get();
    const quiz = state.currentQuiz;

    return {
      current: state.currentQuestionIndex + 1,
      total: quiz?.questionCount || 0,
    };
  },

  getSessionScore: () => {
    const state = get();
    if (!state.currentAttempt || state.isQuizActive) return 0;

    return state.currentAttempt.score;
  },

  getSessionAccuracy: () => {
    const state = get();
    const responses = state.sessionResponses;

    if (responses.length === 0) return 0;

    const correctCount = responses.filter((r) => r.isCorrect).length;
    return (correctCount / responses.length) * 100;
  },

  // Loading states
  setQuizGenerating: (loading: boolean) => {
    set({ isQuizGenerating: loading });
  },

  setQuizError: (error: string | null) => {
    set({ quizError: error });
  },

  // Clear actions
  clearSession: () => {
    set({
      currentQuiz: null,
      currentAttempt: null,
      currentQuestionIndex: 0,
      sessionResponses: [],
      isQuizActive: false,
    });
  },

  getQuizHistory: () => {
    return get().quizHistory;
  },
}));

// Selectors
export const selectCurrentQuestion = (state: QuizState) => state.getCurrentQuestion();
export const selectQuestionProgress = (state: QuizState) => state.getQuestionProgress();
export const selectSessionScore = (state: QuizState) => state.getSessionScore();
export const selectSessionAccuracy = (state: QuizState) => state.getSessionAccuracy();
export const selectIsQuizActive = (state: QuizState) => state.isQuizActive;
export const selectQuizHistory = (state: QuizState) => state.quizHistory;
