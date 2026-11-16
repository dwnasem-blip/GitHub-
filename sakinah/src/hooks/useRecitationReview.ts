import { useState, useCallback } from 'react';
import {
  RecitationReview,
  RecitationFinding,
  TajweedRule,
  ApiResponse,
} from '@/types';
import { recitationAnalysisAPI } from '@/api/recitationAnalysisAPI';

interface UseRecitationReviewState {
  review: RecitationReview | null;
  reviews: RecitationReview[];
  findings: RecitationFinding[];
  tajweedRules: TajweedRule[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseRecitationReviewActions {
  analyzeRecitation: (params: {
    projectId: string;
    audioFileId: string;
    audioUrl: string;
    surahNumber: number;
    surahNameAr: string;
    verseStart: number;
    verseEnd: number;
    confidenceThreshold?: number;
    includeReference?: boolean;
    referenceReader?: string;
    language: 'ar' | 'en';
  }) => Promise<RecitationReview | null>;
  getRecitationReview: (id: string) => Promise<RecitationReview | null>;
  listRecitationReviews: (projectId: string) => Promise<RecitationReview[]>;
  deleteRecitationReview: (id: string) => Promise<boolean>;
  getReferenceAudio: (params: {
    surahNumber: number;
    verseNumber: number;
    wordNumber?: number;
    readerId?: string;
  }) => Promise<{ audioUrl: string; reader: string; source: string } | null>;
  getTajweedRules: () => Promise<TajweedRule[]>;
  getAvailableReaders: () => Promise<
    {
      id: string;
      name: string;
      description?: string;
    }[] | null
  >;
  getAnalysisStatus: (
    analysisId: string
  ) => Promise<{
    status: 'analyzing' | 'completed' | 'failed';
    progress: number;
    findings?: RecitationFinding[];
    error?: string;
  } | null>;
  exportAnalysisReport: (
    reviewId: string,
    format: 'json' | 'csv'
  ) => Promise<string | null>;
  clearState: () => void;
  clearError: () => void;
}

export const useRecitationReview = (): UseRecitationReviewState &
  UseRecitationReviewActions => {
  const [state, setState] = useState<UseRecitationReviewState>({
    review: null,
    reviews: [],
    findings: [],
    tajweedRules: [],
    loading: false,
    error: null,
    success: false,
  });

  const updateState = useCallback(
    (updates: Partial<UseRecitationReviewState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const analyzeRecitation = useCallback(
    async (params: {
      projectId: string;
      audioFileId: string;
      audioUrl: string;
      surahNumber: number;
      surahNameAr: string;
      verseStart: number;
      verseEnd: number;
      confidenceThreshold?: number;
      includeReference?: boolean;
      referenceReader?: string;
      language: 'ar' | 'en';
    }): Promise<RecitationReview | null> => {
      updateState({ loading: true, error: null, success: false });

      try {
        const response = await recitationAnalysisAPI.analyzeRecitation(params);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Analysis failed');
        }

        updateState({
          review: response.data,
          findings: response.data.findings,
          loading: false,
          success: true,
        });

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to analyze recitation';
        updateState({
          error: errorMessage,
          loading: false,
          success: false,
        });
        return null;
      }
    },
    [updateState]
  );

  const getRecitationReview = useCallback(
    async (id: string): Promise<RecitationReview | null> => {
      updateState({ loading: true, error: null });

      try {
        const response = await recitationAnalysisAPI.getRecitationReview(id);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch review');
        }

        updateState({
          review: response.data,
          findings: response.data.findings,
          loading: false,
        });

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch review';
        updateState({
          error: errorMessage,
          loading: false,
        });
        return null;
      }
    },
    [updateState]
  );

  const listRecitationReviews = useCallback(
    async (projectId: string): Promise<RecitationReview[]> => {
      updateState({ loading: true, error: null });

      try {
        const response =
          await recitationAnalysisAPI.listRecitationReviews(projectId);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch reviews');
        }

        updateState({
          reviews: response.data,
          loading: false,
        });

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to list reviews';
        updateState({
          error: errorMessage,
          loading: false,
        });
        return [];
      }
    },
    [updateState]
  );

  const deleteRecitationReview = useCallback(
    async (id: string): Promise<boolean> => {
      updateState({ loading: true, error: null });

      try {
        const response = await recitationAnalysisAPI.deleteRecitationReview(
          id
        );

        if (!response.success) {
          throw new Error(response.error || 'Failed to delete review');
        }

        updateState((prev) => ({
          ...prev,
          reviews: prev.reviews.filter((r) => r.id !== id),
          loading: false,
          success: true,
        }));

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete review';
        updateState({
          error: errorMessage,
          loading: false,
        });
        return false;
      }
    },
    [updateState]
  );

  const getReferenceAudio = useCallback(
    async (params: {
      surahNumber: number;
      verseNumber: number;
      wordNumber?: number;
      readerId?: string;
    }): Promise<{ audioUrl: string; reader: string; source: string } | null> => {
      try {
        const response = await recitationAnalysisAPI.getReferenceAudio(params);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch reference audio');
        }

        return response.data;
      } catch (err) {
        console.error('Error fetching reference audio:', err);
        updateState({
          error:
            err instanceof Error
              ? err.message
              : 'Failed to fetch reference audio',
        });
        return null;
      }
    },
    [updateState]
  );

  const getTajweedRules = useCallback(
    async (): Promise<TajweedRule[]> => {
      updateState({ loading: true, error: null });

      try {
        const response = await recitationAnalysisAPI.getTajweedRules();

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch Tajweed rules');
        }

        updateState({
          tajweedRules: response.data,
          loading: false,
        });

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to fetch Tajweed rules';
        updateState({
          error: errorMessage,
          loading: false,
        });
        return [];
      }
    },
    [updateState]
  );

  const getAvailableReaders = useCallback(
    async (): Promise<
      {
        id: string;
        name: string;
        description?: string;
      }[] | null
    > => {
      try {
        const response = await recitationAnalysisAPI.getAvailableReaders();

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch readers');
        }

        return response.data;
      } catch (err) {
        console.error('Error fetching readers:', err);
        return null;
      }
    },
    [updateState]
  );

  const getAnalysisStatus = useCallback(
    async (
      analysisId: string
    ): Promise<{
      status: 'analyzing' | 'completed' | 'failed';
      progress: number;
      findings?: RecitationFinding[];
      error?: string;
    } | null> => {
      try {
        const response = await recitationAnalysisAPI.getAnalysisStatus(
          analysisId
        );

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to get analysis status');
        }

        return response.data;
      } catch (err) {
        console.error('Error getting analysis status:', err);
        return null;
      }
    },
    [updateState]
  );

  const exportAnalysisReport = useCallback(
    async (reviewId: string, format: 'json' | 'csv' = 'json'): Promise<string | null> => {
      try {
        const response = await recitationAnalysisAPI.exportAnalysisReport(
          reviewId,
          format
        );

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to export report');
        }

        return response.data;
      } catch (err) {
        console.error('Error exporting report:', err);
        return null;
      }
    },
    [updateState]
  );

  const clearState = useCallback(() => {
    setState({
      review: null,
      reviews: [],
      findings: [],
      tajweedRules: [],
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  return {
    ...state,
    analyzeRecitation,
    getRecitationReview,
    listRecitationReviews,
    deleteRecitationReview,
    getReferenceAudio,
    getTajweedRules,
    getAvailableReaders,
    getAnalysisStatus,
    exportAnalysisReport,
    clearState,
    clearError,
  };
};
