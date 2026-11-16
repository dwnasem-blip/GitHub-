import { supabase } from '@/config/supabase';

/**
 * Reference Audio Service - Manages reference Quranic audio recordings
 * Provides access to reference audio for comparison with user recitations
 */
export const referenceAudioService = {
  // Default readers from Quran.com API
  defaultReaders: {
    abdul_basit: 'abdul_basit_murattal',
    al_minshawi: 'al_minshawi_murattal',
    abdul_samad: 'abdul_samad_al_quraishy',
  },

  /**
   * Get reference audio URL for a specific word/verse
   * Falls back to Quran.com public API if not in database
   */
  async getReferenceAudio(params: {
    surah_number: number;
    verse_number: number;
    word_number?: number;
    reader_id?: string;
  }): Promise<{ audioUrl: string; reader: string; source: 'database' | 'api' }> {
    const readerId = params.reader_id || this.defaultReaders.abdul_basit;

    try {
      // Try to get from database first
      const dbResult = await this.getReferenceAudioFromDatabase(
        params.surah_number,
        params.verse_number,
        readerId
      );

      if (dbResult) {
        return {
          audioUrl: dbResult.audio_url,
          reader: dbResult.reader_name,
          source: 'database',
        };
      }
    } catch (error) {
      console.error('Error fetching reference audio from database:', error);
    }

    // Fall back to Quran.com API
    return this.getReferenceAudioFromAPI(
      params.surah_number,
      params.verse_number,
      readerId
    );
  },

  /**
   * Get reference audio from database
   */
  async getReferenceAudioFromDatabase(
    surahNumber: number,
    verseNumber: number,
    readerId: string
  ): Promise<{
    audio_url: string;
    reader_name: string;
  } | null> {
    const { data, error } = await supabase
      .from('reference_audio')
      .select('audio_url, reader_name')
      .eq('surah_number', surahNumber)
      .eq('verse_number', verseNumber)
      .eq('reader_id', readerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error fetching reference audio:', error);
    }

    return data || null;
  },

  /**
   * Get reference audio from Quran.com public API
   * This provides a free fallback for all verses
   */
  async getReferenceAudioFromAPI(
    surahNumber: number,
    verseNumber: number,
    readerId: string
  ): Promise<{ audioUrl: string; reader: string; source: 'api' }> {
    try {
      // Construct Quran.com API URL
      // Format: https://api.quran.com/api/v4/recitations/{recitation_id}/by_ayah/{ayah_id}
      // Ayah ID = surah * 1000 + verse

      const ayahId = surahNumber * 1000 + verseNumber;

      // Map our reader IDs to Quran.com recitation IDs
      const recitationId = this.mapReaderToRecitationId(readerId);

      const apiUrl = `https://api.quran.com/api/v4/recitations/${recitationId}/by_ayah/${ayahId}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.audio_file || !data.audio_file.url) {
        throw new Error('No audio URL in API response');
      }

      return {
        audioUrl: data.audio_file.url,
        reader: this.getReaderName(readerId),
        source: 'api',
      };
    } catch (error) {
      console.error('Error fetching from Quran.com API:', error);
      throw new Error(
        `Failed to fetch reference audio for Surah ${surahNumber}, Verse ${verseNumber}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  },

  /**
   * Map internal reader IDs to Quran.com recitation IDs
   */
  mapReaderToRecitationId(readerId: string): number {
    const mapping: Record<string, number> = {
      abdul_basit_murattal: 1,
      al_minshawi_murattal: 2,
      abdul_samad_al_quraishy: 3,
      mishari_al_afasy: 5,
      muhammad_jibreel: 7,
      fahad_al_kandari: 8,
    };

    return mapping[readerId] || 1; // Default to Abdul Basit
  },

  /**
   * Get reader display name
   */
  getReaderName(readerId: string): string {
    const names: Record<string, string> = {
      abdul_basit_murattal: 'Abdul Basit',
      al_minshawi_murattal: 'Al-Minshawi',
      abdul_samad_al_quraishy: 'Abdul Samad',
      mishari_al_afasy: 'Mishari Al-Afasy',
      muhammad_jibreel: 'Muhammad Jibreel',
      fahad_al_kandari: 'Fahad Al-Kandari',
    };

    return names[readerId] || 'Unknown Reader';
  },

  /**
   * Get all available reference readers
   */
  async getAvailableReaders(): Promise<
    {
      id: string;
      name: string;
      description?: string;
    }[]
  > {
    try {
      const { data, error } = await supabase
        .from('reference_readers')
        .select('id, name, description')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching readers from database:', error);
        return this.getDefaultReaders();
      }

      return data || this.getDefaultReaders();
    } catch (error) {
      console.error('Exception fetching readers:', error);
      return this.getDefaultReaders();
    }
  },

  /**
   * Get default available readers
   */
  getDefaultReaders(): {
    id: string;
    name: string;
    description?: string;
  }[] {
    return [
      {
        id: this.defaultReaders.abdul_basit,
        name: 'Abdul Basit',
        description: 'Clear and smooth recitation',
      },
      {
        id: this.defaultReaders.al_minshawi,
        name: 'Al-Minshawi',
        description: 'Melodic recitation',
      },
      {
        id: this.defaultReaders.abdul_samad,
        name: 'Abdul Samad',
        description: 'Moderate pace recitation',
      },
      {
        id: 'mishari_al_afasy',
        name: 'Mishari Al-Afasy',
        description: 'Modern clear recitation',
      },
      {
        id: 'muhammad_jibreel',
        name: 'Muhammad Jibreel',
        description: 'Soft and gentle recitation',
      },
      {
        id: 'fahad_al_kandari',
        name: 'Fahad Al-Kandari',
        description: 'Moderate and clear recitation',
      },
    ];
  },

  /**
   * Store reference audio metadata in database
   * (For offline support or caching)
   */
  async storeReferenceAudio(params: {
    surah_number: number;
    verse_number: number;
    reader_id: string;
    reader_name: string;
    audio_url: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('reference_audio')
      .insert({
        surah_number: params.surah_number,
        verse_number: params.verse_number,
        reader_id: params.reader_id,
        reader_name: params.reader_name,
        audio_url: params.audio_url,
        created_at: new Date().toISOString(),
      })
      .on('*', (payload) => {
        console.log('Reference audio stored:', payload);
      });

    if (error) {
      console.error('Error storing reference audio:', error);
      // Don't throw - this is not critical for analysis
    }
  },

  /**
   * Get Quranic text with timing information
   * This helps synchronize reference audio with text display
   */
  async getQuranTextWithTimings(
    surahNumber: number,
    verseStart: number,
    verseEnd: number
  ): Promise<
    {
      verse_number: number;
      arabic_text: string;
      english_translation?: string;
      word_timings?: {
        word: string;
        start_time: number;
        end_time: number;
      }[];
    }[]
  > {
    try {
      const { data, error } = await supabase
        .from('quran_verses')
        .select('*')
        .eq('surah_number', surahNumber)
        .gte('verse_number', verseStart)
        .lte('verse_number', verseEnd)
        .order('verse_number', { ascending: true });

      if (error) {
        console.error('Error fetching Quranic text:', error);
        return this.getFallbackQuranText(surahNumber, verseStart, verseEnd);
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching Quranic text:', error);
      return this.getFallbackQuranText(surahNumber, verseStart, verseEnd);
    }
  },

  /**
   * Fallback Quranic text (for when database is unavailable)
   * This should be replaced with actual Quranic text
   */
  getFallbackQuranText(
    surahNumber: number,
    verseStart: number,
    verseEnd: number
  ): {
    verse_number: number;
    arabic_text: string;
  }[] {
    // This is a placeholder - in production, fetch from Quran.com API
    console.warn(
      'Using fallback Quranic text - implement proper Quran API integration'
    );
    return [];
  },

  /**
   * Verify reference audio accessibility
   */
  async verifyAudioAccessibility(audioUrl: string): Promise<boolean> {
    try {
      const response = await fetch(audioUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error verifying audio accessibility:', error);
      return false;
    }
  },

  /**
   * Get audio duration
   */
  async getAudioDuration(audioUrl: string): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
          resolve(audio.duration);
        };
        audio.onerror = () => {
          reject(new Error('Failed to load audio'));
        };
        audio.src = audioUrl;
      } catch (error) {
        reject(error);
      }
    });
  },
};
