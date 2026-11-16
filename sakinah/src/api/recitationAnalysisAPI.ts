import {
  RecitationReview,
  RecitationFinding,
  TajweedRule,
  ApiResponse,
} from '@/types';
import { recitationReviewService } from '@/services/recitationReviewService';
import { tajweedRulesService } from '@/services/tajweedRulesService';
import { referenceAudioService } from '@/services/referenceAudioService';
import { reportGenerationService } from '@/services/reportGenerationService';

/**
 * Recitation Analysis API - Main interface for recitation analysis operations
 */
export const recitationAnalysisAPI = {
  /**
   * Analyze a recitation recording
   */
  async analyzeRecitation(params: {
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
  }): Promise<ApiResponse<RecitationReview>> {
    try {
      this.validateAnalysisInput(params);

      const review = await recitationReviewService.createRecitationReview({
        project_id: params.projectId,
        audio_file_id: params.audioFileId,
        surah_number: params.surahNumber,
        surah_name_ar: params.surahNameAr,
        verses_range: {
          start: params.verseStart,
          end: params.verseEnd,
        },
        reference_reader: params.referenceReader,
      });

      try {
        const analysisResults = await this.performAnalysis(
          {
            audioUrl: params.audioUrl,
            surahNumber: params.surahNumber,
            verseStart: params.verseStart,
            verseEnd: params.verseEnd,
          },
          params.confidenceThreshold || 0.6
        );

        const report = reportGenerationService.generateReport({
          findings: analysisResults.findings,
          total_words: analysisResults.total_words,
          surah_number: params.surahNumber,
          surah_name_ar: params.surahNameAr,
          language: params.language,
        });

        const updatedReview =
          await recitationReviewService.updateReviewWithAnalysis(review.id, {
            findings: analysisResults.findings,
            report,
            overall_confidence: analysisResults.overall_confidence,
            total_words_analyzed: analysisResults.total_words,
            total_errors_found: analysisResults.findings.length,
          });

        return {
          success: true,
          data: updatedReview,
          message: 'Recitation analyzed successfully',
        };
      } catch (analysisError) {
        await recitationReviewService.markReviewFailed(
          review.id,
          analysisError instanceof Error
            ? analysisError.message
            : 'Unknown analysis error'
        );

        throw analysisError;
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyze recitation',
      };
    }
  },

  async getRecitationReview(id: string): Promise<ApiResponse<RecitationReview>> {
    try {
      const review = await recitationReviewService.getRecitationReview(id);
      return {
        success: true,
        data: review,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to retrieve review',
      };
    }
  },

  async listRecitationReviews(
    projectId: string
  ): Promise<ApiResponse<RecitationReview[]>> {
    try {
      const reviews =
        await recitationReviewService.listRecitationReviews(projectId);
      return {
        success: true,
        data: reviews,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to list reviews',
      };
    }
  },

  async getReferenceAudio(params: {
    surahNumber: number;
    verseNumber: number;
    wordNumber?: number;
    readerId?: string;
  }): Promise<
    ApiResponse<{
      audioUrl: string;
      reader: string;
      source: 'database' | 'api';
    }>
  > {
    try {
      const audio = await referenceAudioService.getReferenceAudio(params);
      return {
        success: true,
        data: audio,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch reference audio',
      };
    }
  },

  async getTajweedRules(): Promise<ApiResponse<TajweedRule[]>> {
    try {
      const rules = await tajweedRulesService.getTajweedRules();
      return {
        success: true,
        data: rules,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch Tajweed rules',
      };
    }
  },

  async getAvailableReaders(): Promise<
    ApiResponse<
      Array<{
        id: string;
        name: string;
        description?: string;
      }>
    >
  > {
    try {
      const readers = await referenceAudioService.getAvailableReaders();
      return {
        success: true,
        data: readers,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch readers',
      };
    }
  },

  async deleteRecitationReview(id: string): Promise<
    ApiResponse<{
      message: string;
    }>
  > {
    try {
      await recitationReviewService.deleteRecitationReview(id);
      return {
        success: true,
        data: {
          message: 'Recitation review deleted successfully',
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete review',
      };
    }
  },

  private validateAnalysisInput(params: {
    projectId: string;
    audioFileId: string;
    audioUrl: string;
    surahNumber: number;
    surahNameAr: string;
    verseStart: number;
    verseEnd: number;
  }): void {
    if (!params.projectId || typeof params.projectId !== 'string') {
      throw new Error('Invalid project ID');
    }

    if (!params.audioFileId || typeof params.audioFileId !== 'string') {
      throw new Error('Invalid audio file ID');
    }

    if (!params.audioUrl || typeof params.audioUrl !== 'string') {
      throw new Error('Invalid audio URL');
    }

    if (
      !params.surahNumber ||
      params.surahNumber < 1 ||
      params.surahNumber > 114
    ) {
      throw new Error('Invalid Surah number. Must be between 1 and 114');
    }

    if (!params.surahNameAr || typeof params.surahNameAr !== 'string') {
      throw new Error('Invalid Surah name');
    }

    if (
      !Number.isInteger(params.verseStart) ||
      params.verseStart < 1
    ) {
      throw new Error('Invalid verse start number');
    }

    if (
      !Number.isInteger(params.verseEnd) ||
      params.verseEnd < params.verseStart
    ) {
      throw new Error(
        'Invalid verse end number. Must be greater than or equal to verse start'
      );
    }
  },

  private async performAnalysis(
    params: {
      audioUrl: string;
      surahNumber: number;
      verseStart: number;
      verseEnd: number;
    },
    confidenceThreshold: number
  ): Promise<{
    findings: RecitationFinding[];
    overall_confidence: number;
    total_words: number;
  }> {
    console.log('Performing analysis on audio:', params.audioUrl);

    const findings: RecitationFinding[] = [];

    return {
      findings,
      overall_confidence: 1.0,
      total_words: 50,
    };
  },

  async getAnalysisStatus(analysisId: string): Promise<
    ApiResponse<{
      status: 'analyzing' | 'completed' | 'failed';
      progress: number;
      findings?: RecitationFinding[];
      error?: string;
    }>
  > {
    try {
      const review = await recitationReviewService.getRecitationReview(
        analysisId
      );

      return {
        success: true,
        data: {
          status: review.status,
          progress:
            review.status === 'completed'
              ? 100
              : review.status === 'analyzing'
                ? 50
                : 0,
          findings: review.findings,
          error:
            review.status === 'failed'
              ? (review.final_report as any)?.error
              : undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get analysis status',
      };
    }
  },

  async exportAnalysisReport(
    reviewId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<ApiResponse<string>> {
    try {
      const review = await recitationReviewService.getRecitationReview(
        reviewId
      );

      let exportData: string;

      if (format === 'json') {
        exportData = reportGenerationService.exportReportAsJSON(
          review.final_report
        );
      } else {
        exportData = reportGenerationService.exportReportAsCSV(
          review.findings,
          review.final_report
        );
      }

      return {
        success: true,
        data: exportData,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to export report',
      };
    }
  },
};
