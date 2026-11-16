import { supabase } from '@/config/supabase';
import {
  RecitationMatch,
  Finding,
  RecitationReviewData,
  VerseMatch,
 ApiResponse } from '@/types';

class RecitationService {
  /**
   * Fetch a specific recitation match by ID
   */
  async getRecitationMatch(id: string): Promise<RecitationMatch> {
    try {
      const { data, error } = await supabase
        .from('recitation_matches')
        .select(`
          id,
          audio_file_id,
          surah_number,
          surah_name_ar,
          surah_name_en,
          confidence,
          overall_accuracy,
          total_words,
          correct_words,
          created_at,
          user_id
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch verses
      const verses = await this.getVerses(id);

      return {
        ...data,
        verses,
      };
    } catch (error) {
      console.error('Error fetching recitation match:', error);
      throw error;
    }
  }

  /**
   * Fetch verses for a specific recitation match
   */
  async getVerses(recitationMatchId: string): Promise<VerseMatch[]> {
    try {
      const { data, error } = await supabase
        .from('verse_timings')
        .select(`
          id,
          recitation_match_id,
          verse_number,
          arabic_text,
          english_translation,
          start_time,
          end_time,
          confidence,
          word_timings
        `)
        .eq('recitation_match_id', recitationMatchId)
        .order('verse_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching verses:', error);
      throw error;
    }
  }

  /**
   * Fetch all findings for a recitation match
   */
  async getFindings(recitationMatchId: string): Promise<Finding[]> {
    try {
      const { data, error } = await supabase
        .from('findings')
        .select(`
          id,
          recitation_match_id,
          word_id,
          arabic_word,
          transliteration,
          start_time,
          end_time,
          confidence,
          error_type,
          severity,
          expected_pronunciation,
          detected_pronunciation,
          description_ar,
          description_en,
          tajweed_rule,
          reference_audio_timestamp,
          created_at
        `)
        .eq('recitation_match_id', recitationMatchId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching findings:', error);
      throw error;
    }
  }

  /**
   * Fetch complete recitation review data
   */
  async getRecitationReviewData(
    recitationMatchId: string
  ): Promise<RecitationReviewData> {
    try {
      const recitationMatch = await this.getRecitationMatch(recitationMatchId);
      const findings = await this.getFindings(recitationMatchId);
      const verses = await this.getVerses(recitationMatchId);

      return {
        recitationMatch,
        findings,
        verses,
      };
    } catch (error) {
      console.error('Error fetching recitation review data:', error);
      throw error;
    }
  }

  /**
   * Get audio URL for a file
   */
  async getAudioUrl(audioFileId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('audio_files')
        .select('file_url')
        .eq('id', audioFileId)
        .single();

      if (error) throw error;
      return data?.file_url || '';
    } catch (error) {
      console.error('Error fetching audio URL:', error);
      throw error;
    }
  }

  /**
   * Get reference audio URL for comparison
   */
  async getReferenceAudioUrl(surahNumber: number): Promise<string | null> {
    try {
      // This would fetch from a reference Quran recitations table
      // For now, return null as placeholder
      return null;
    } catch (error) {
      console.error('Error fetching reference audio:', error);
      return null;
    }
  }

  /**
   * Export recitation report
   */
  async exportReport(
    recitationMatchId: string,
    format: 'json' | 'pdf'
  ): Promise<string> {
    try {
      const data = await this.getRecitationReviewData(recitationMatchId);

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      }

      // PDF export would require additional service
      throw new Error('PDF export not yet implemented');
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  /**
   * Share results with email
   */
  async shareResults(
    recitationMatchId: string,
    email: string
  ): Promise<ApiResponse<void>> {
    try {
      // This would call a backend API to send email
      console.log(`Sharing results with ${email}`);
      return { success: true };
    } catch (error) {
      console.error('Error sharing results:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a practice session based on findings
   */
  async createPracticeSession(findings: Finding[]): Promise<string> {
    try {
      // This would create a new session focused on problematic words
      const sessionId = `session_${Date.now()}`;
      return sessionId;
    } catch (error) {
      console.error('Error creating practice session:', error);
      throw error;
    }
  }

  /**
   * Get statistics for all recitation matches by user
   */
  async getUserStatistics(): Promise<{
    totalRecitations: number;
    averageAccuracy: number;
    totalWords: number;
    commonErrors: { type: string; count: number }[];
  }> {
    try {
      // This would aggregate user statistics
      return {
        totalRecitations: 0,
        averageAccuracy: 0,
        totalWords: 0,
        commonErrors: [],
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }
}

export const recitationService = new RecitationService();
