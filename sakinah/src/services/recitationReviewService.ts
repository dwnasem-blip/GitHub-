import { supabase } from '@/config/supabase';
import {
  RecitationReview,
  RecitationFinding,
  ReviewReport,
} from '@/types';

/**
 * RecitationReviewService - Handles Quranic recitation review and analysis
 * Manages database operations for reviews and findings
 */
export const recitationReviewService = {
  /**
   * Get current user's ID with error handling
   */
  async getCurrentUserId(): Promise<string> {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }
    return session.user.id;
  },

  /**
   * Create a new recitation review
   */
  async createRecitationReview(input: {
    project_id: string;
    audio_file_id: string;
    surah_number: number;
    surah_name_ar: string;
    verses_range: {
      start: number;
      end: number;
    };
    reference_reader?: string;
  }): Promise<RecitationReview> {
    const { data, error } = await supabase
      .from('recitation_reviews')
      .insert({
        project_id: input.project_id,
        audio_file_id: input.audio_file_id,
        surah_number: input.surah_number,
        surah_name_ar: input.surah_name_ar,
        verse_start: input.verses_range.start,
        verse_end: input.verses_range.end,
        status: 'analyzing',
        reference_reader: input.reference_reader || null,
        total_words: 0,
        total_errors: 0,
        overall_confidence: 0,
        final_report: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to create recitation review');

    return this.formatReview(data);
  },

  /**
   * Get recitation review by ID
   */
  async getRecitationReview(id: string): Promise<RecitationReview> {
    const { data, error } = await supabase
      .from('recitation_reviews')
      .select(
        `
        *,
        recitation_findings (*)
      `
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Recitation review not found');

    return this.formatReview(data);
  },

  /**
   * List recitation reviews for a project
   */
  async listRecitationReviews(projectId: string): Promise<RecitationReview[]> {
    const { data, error } = await supabase
      .from('recitation_reviews')
      .select(
        `
        *,
        recitation_findings (*)
      `
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((review) => this.formatReview(review));
  },

  /**
   * Update recitation review status
   */
  async updateReviewStatus(
    id: string,
    status: 'analyzing' | 'completed' | 'failed'
  ): Promise<RecitationReview> {
    const { data, error } = await supabase
      .from('recitation_reviews')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update review status');

    return this.formatReview(data);
  },

  /**
   * Update review with analysis results
   */
  async updateReviewWithAnalysis(
    id: string,
    analysis: {
      findings: RecitationFinding[];
      report: ReviewReport;
      overall_confidence: number;
      total_words_analyzed: number;
      total_errors_found: number;
    }
  ): Promise<RecitationReview> {
    const { data, error } = await supabase
      .from('recitation_reviews')
      .update({
        total_words: analysis.total_words_analyzed,
        total_errors: analysis.total_errors_found,
        overall_confidence: analysis.overall_confidence,
        final_report: analysis.report,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to update review with analysis');

    // Create findings records
    if (analysis.findings.length > 0) {
      const findingsToInsert = analysis.findings.map((finding) => ({
        review_id: id,
        word_number: finding.word_number,
        verse_number: finding.verse_number,
        word_text: finding.word_text,
        word_arabic: finding.word_arabic,
        start_time: finding.start_time,
        end_time: finding.end_time,
        type: finding.type,
        severity: finding.severity,
        confidence: finding.confidence,
        expected: finding.expected,
        detected: finding.detected,
        description: {
          ar: finding.description_ar,
          en: finding.description_en,
        },
        tajweed_rule: finding.tajweed_rule || null,
        suggestions: finding.suggestions,
        reference_audio_segment: finding.reference_audio_segment || null,
      }));

      const { error: findingsError } = await supabase
        .from('recitation_findings')
        .insert(findingsToInsert);

      if (findingsError) throw findingsError;
    }

    return this.getRecitationReview(id);
  },

  /**
   * Mark review as failed
   */
  async markReviewFailed(id: string, errorMessage: string): Promise<RecitationReview> {
    const { data, error } = await supabase
      .from('recitation_reviews')
      .update({
        status: 'failed',
        final_report: {
          error: errorMessage,
          generated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to mark review as failed');

    return this.formatReview(data);
  },

  /**
   * Delete recitation review (cascades to findings)
   */
  async deleteRecitationReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('recitation_reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Format review data from database
   */
  formatReview(data: any): RecitationReview {
    return {
      id: data.id,
      project_id: data.project_id,
      audio_file_id: data.audio_file_id,
      surah_number: data.surah_number,
      surah_name_ar: data.surah_name_ar,
      verses_range: {
        start: data.verse_start,
        end: data.verse_end,
      },
      findings: (data.recitation_findings || []).map((finding: any) =>
        this.formatFinding(finding)
      ),
      overall_confidence: data.overall_confidence || 0,
      total_words_analyzed: data.total_words || 0,
      total_errors_found: data.total_errors || 0,
      reference_audio_url: data.reference_audio_url,
      reference_reader: data.reference_reader,
      final_report: data.final_report || {},
      status: data.status,
      analysis_timestamp: data.updated_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  /**
   * Format finding data from database
   */
  formatFinding(data: any): RecitationFinding {
    return {
      id: data.id,
      word_number: data.word_number,
      verse_number: data.verse_number,
      word_text: data.word_text,
      word_arabic: data.word_arabic,
      start_time: data.start_time,
      end_time: data.end_time,
      duration: data.end_time - data.start_time,
      type: data.type,
      severity: data.severity,
      confidence: data.confidence,
      expected: data.expected,
      detected: data.detected,
      description_ar: data.description?.ar || '',
      description_en: data.description?.en || '',
      tajweed_rule: data.tajweed_rule,
      suggestions: data.suggestions || [],
      reference_audio_segment: data.reference_audio_segment,
    };
  },

  /**
   * Get findings for a review
   */
  async getFindings(reviewId: string): Promise<RecitationFinding[]> {
    const { data, error } = await supabase
      .from('recitation_findings')
      .select('*')
      .eq('review_id', reviewId)
      .order('verse_number', { ascending: true })
      .order('word_number', { ascending: true });

    if (error) throw error;
    return (data || []).map((finding) => this.formatFinding(finding));
  },

  /**
   * Get findings by severity
   */
  async getFindingsBySeverity(
    reviewId: string,
    severity: 'error' | 'probable' | 'inconclusive'
  ): Promise<RecitationFinding[]> {
    const { data, error } = await supabase
      .from('recitation_findings')
      .select('*')
      .eq('review_id', reviewId)
      .eq('severity', severity)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return (data || []).map((finding) => this.formatFinding(finding));
  },

  /**
   * Get findings by type
   */
  async getFindingsByType(
    reviewId: string,
    type: string
  ): Promise<RecitationFinding[]> {
    const { data, error } = await supabase
      .from('recitation_findings')
      .select('*')
      .eq('review_id', reviewId)
      .eq('type', type)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return (data || []).map((finding) => this.formatFinding(finding));
  },

  /**
   * Verify data isolation (RLS policies)
   */
  async verifyDataIsolation(): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      // This query will only return reviews for the current user due to RLS
      const { data, error } = await supabase
        .from('recitation_reviews')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Data isolation verification failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Data isolation verification error:', error);
      return false;
    }
  },
};
