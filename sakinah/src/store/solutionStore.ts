import { create } from "zustand";
import { Solution } from "@services/claudeService";

export interface Problem {
  id: string;
  userId: string;
  imageUrl: string;
  extractedText: string;
  subject: string;
  difficulty?: "easy" | "medium" | "hard";
  ocrConfidence: number;
  createdAt: string;
  isVerified: boolean;
}

export interface SolutionState {
  // Problems (from OCR)
  currentProblem: Problem | null;
  problemHistory: Problem[];

  // Solutions (AI-generated)
  currentSolution: Solution | null;
  solutionCache: Map<string, Solution>; // Cache by hash key
  solutionHistory: Solution[];

  // Loading states
  isOCRProcessing: boolean;
  isSolutionGenerating: boolean;
  ocrError: string | null;
  solutionError: string | null;

  // Bookmarks
  bookmarkedSolutions: string[]; // Solution IDs

  // Actions
  setProblem: (problem: Problem) => void;
  addProblemToHistory: (problem: Problem) => void;
  clearCurrentProblem: () => void;

  setSolution: (solution: Solution) => void;
  addSolutionToCache: (cacheKey: string, solution: Solution) => void;
  getSolutionFromCache: (cacheKey: string) => Solution | undefined;
  addSolutionToHistory: (solution: Solution) => void;
  clearCurrentSolution: () => void;

  setOCRProcessing: (loading: boolean) => void;
  setOCRError: (error: string | null) => void;

  setSolutionGenerating: (loading: boolean) => void;
  setSolutionError: (error: string | null) => void;

  toggleBookmark: (solutionId: string) => void;
  isBookmarked: (solutionId: string) => boolean;

  clearHistory: () => void;
  clearCache: () => void;
}

export const useSolutionStore = create<SolutionState>((set, get) => ({
  // Initial state
  currentProblem: null,
  problemHistory: [],
  currentSolution: null,
  solutionCache: new Map(),
  solutionHistory: [],
  isOCRProcessing: false,
  isSolutionGenerating: false,
  ocrError: null,
  solutionError: null,
  bookmarkedSolutions: [],

  // Problem actions
  setProblem: (problem: Problem) => {
    set({ currentProblem: problem, ocrError: null });
  },

  addProblemToHistory: (problem: Problem) => {
    set((state) => ({
      problemHistory: [problem, ...state.problemHistory.filter((p) => p.id !== problem.id)],
    }));
  },

  clearCurrentProblem: () => {
    set({ currentProblem: null });
  },

  // Solution actions
  setSolution: (solution: Solution) => {
    set({ currentSolution: solution, solutionError: null });
  },

  addSolutionToCache: (cacheKey: string, solution: Solution) => {
    set((state) => {
      const newCache = new Map(state.solutionCache);
      newCache.set(cacheKey, solution);
      return { solutionCache: newCache };
    });
  },

  getSolutionFromCache: (cacheKey: string) => {
    return get().solutionCache.get(cacheKey);
  },

  addSolutionToHistory: (solution: Solution) => {
    set((state) => ({
      solutionHistory: [solution, ...state.solutionHistory.filter((s) => s.id !== solution.id)],
    }));
  },

  clearCurrentSolution: () => {
    set({ currentSolution: null });
  },

  // Loading states
  setOCRProcessing: (loading: boolean) => {
    set({ isOCRProcessing: loading });
  },

  setOCRError: (error: string | null) => {
    set({ ocrError: error });
  },

  setSolutionGenerating: (loading: boolean) => {
    set({ isSolutionGenerating: loading });
  },

  setSolutionError: (error: string | null) => {
    set({ solutionError: error });
  },

  // Bookmark actions
  toggleBookmark: (solutionId: string) => {
    set((state) => ({
      bookmarkedSolutions: state.bookmarkedSolutions.includes(solutionId)
        ? state.bookmarkedSolutions.filter((id) => id !== solutionId)
        : [...state.bookmarkedSolutions, solutionId],
    }));
  },

  isBookmarked: (solutionId: string) => {
    return get().bookmarkedSolutions.includes(solutionId);
  },

  // Clear actions
  clearHistory: () => {
    set({ problemHistory: [], solutionHistory: [] });
  },

  clearCache: () => {
    set({ solutionCache: new Map() });
  },
}));

// Selectors for performance optimization
export const selectCurrentProblem = (state: SolutionState) => state.currentProblem;
export const selectCurrentSolution = (state: SolutionState) => state.currentSolution;
export const selectIsLoading = (state: SolutionState) =>
  state.isOCRProcessing || state.isSolutionGenerating;
export const selectProblemHistory = (state: SolutionState) => state.problemHistory;
export const selectSolutionHistory = (state: SolutionState) => state.solutionHistory;
export const selectBookmarkedSolutions = (state: SolutionState) => state.bookmarkedSolutions;
