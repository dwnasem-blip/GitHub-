/**
 * Quranic Text Database Service
 * Manages access to official Quranic text from trusted sources
 */

import { QuranicVerse, QuranicWord } from '../types';

/**
 * Surah (Chapter) metadata
 */
export interface SurahMetadata {
  number: number;
  name_ar: string;
  name_en: string;
  name_transliteration: string;
  revelation_order: number;
  revelation_place: 'mecca' | 'medina';
  verse_count: number;
}

/**
 * Cache for Quranic text
 */
let quranicTextCache: Map<string, QuranicVerse> = new Map();

/**
 * Cache for Surah metadata
 */
let surahMetadataCache: Map<number, SurahMetadata> = new Map();

/**
 * Get Quranic text for specific verses
 * Uses Quran.com API as trusted source
 */
export async function getQuranicText(
  surahNumber: number,
  verseStart: number,
  verseEnd: number
): Promise<QuranicVerse[]> {
  try {
    const verses: QuranicVerse[] = [];

    for (let verseNumber = verseStart; verseNumber <= verseEnd; verseNumber++) {
      const cacheKey = `${surahNumber}:${verseNumber}`;

      // Check cache first
      if (quranicTextCache.has(cacheKey)) {
        verses.push(quranicTextCache.get(cacheKey)!);
        continue;
      }

      // Fetch from Quran.com API
      const verse = await fetchVerseFromQuranCom(surahNumber, verseNumber);
      if (verse) {
        quranicTextCache.set(cacheKey, verse);
        verses.push(verse);
      }
    }

    return verses;
  } catch (error) {
    console.error('Error retrieving Quranic text:', error);
    throw new Error(`Failed to retrieve Quranic text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch verse from Quran.com API
 */
async function fetchVerseFromQuranCom(surahNumber: number, verseNumber: number): Promise<QuranicVerse | null> {
  try {
    // Quran.com API endpoint for specific verse
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/${surahNumber}:${verseNumber}?language=en&fields=text_indopak,transliteration`
    );

    if (!response.ok) {
      console.warn(`Failed to fetch verse ${surahNumber}:${verseNumber}`);
      return null;
    }

    const data: any = await response.json();

    if (!data.verse) {
      console.warn(`No verse data for ${surahNumber}:${verseNumber}`);
      return null;
    }

    const verseData = data.verse;
    const words = parseVerseIntoWords(
      verseData.text_indopak,
      verseData.transliteration || ''
    );

    return {
      surah_number: surahNumber,
      verse_number: verseNumber,
      arabic_text: verseData.text_indopak,
      transliteration: verseData.transliteration || '',
      english_translation: verseData.text_english || undefined,
      word_count: words.length,
      words,
    };
  } catch (error) {
    console.error(`Error fetching verse from Quran.com: ${error}`);
    return null;
  }
}

/**
 * Parse verse into individual words
 */
function parseVerseIntoWords(
  arabicText: string,
  transliteration: string
): QuranicWord[] {
  const words: QuranicWord[] = [];

  // Split by spaces to get words
  const arabicWords = arabicText.trim().split(/\s+/);
  const transliterationParts = transliteration.trim().split(/\s+/);

  for (let i = 0; i < arabicWords.length; i++) {
    words.push({
      word_number: i + 1,
      arabic: arabicWords[i],
      transliteration: transliterationParts[i] || '',
      english: undefined,
    });
  }

  return words;
}

/**
 * Get Surah metadata
 */
export async function getSurahMetadata(surahNumber: number): Promise<SurahMetadata | null> {
  try {
    // Check cache first
    if (surahMetadataCache.has(surahNumber)) {
      return surahMetadataCache.get(surahNumber)!;
    }

    // Fetch from API
    const response = await fetch(`https://api.quran.com/api/v4/chapters/${surahNumber}`);

    if (!response.ok) {
      console.warn(`Failed to fetch Surah ${surahNumber} metadata`);
      return null;
    }

    const data: any = await response.json();

    if (!data.chapter) {
      console.warn(`No metadata for Surah ${surahNumber}`);
      return null;
    }

    const chapter = data.chapter;
    const metadata: SurahMetadata = {
      number: chapter.id,
      name_ar: chapter.name_arabic,
      name_en: chapter.name_english,
      name_transliteration: chapter.name_simple,
      revelation_order: chapter.revelation_order,
      revelation_place: chapter.revelation_place === 'mecca' ? 'mecca' : 'medina',
      verse_count: chapter.verses_count,
    };

    surahMetadataCache.set(surahNumber, metadata);
    return metadata;
  } catch (error) {
    console.error(`Error fetching Surah metadata: ${error}`);
    return null;
  }
}

/**
 * Get all Surah names and verse counts
 */
export async function getAllSurahMetadata(): Promise<SurahMetadata[]> {
  try {
    const response = await fetch('https://api.quran.com/api/v4/chapters');

    if (!response.ok) {
      throw new Error('Failed to fetch chapters list');
    }

    const data: any = await response.json();

    if (!data.chapters) {
      throw new Error('No chapters data');
    }

    const metadataList: SurahMetadata[] = data.chapters.map((chapter: any) => ({
      number: chapter.id,
      name_ar: chapter.name_arabic,
      name_en: chapter.name_english,
      name_transliteration: chapter.name_simple,
      revelation_order: chapter.revelation_order,
      revelation_place: chapter.revelation_place === 'mecca' ? 'mecca' : 'medina',
      verse_count: chapter.verses_count,
    }));

    // Cache all
    for (const metadata of metadataList) {
      surahMetadataCache.set(metadata.number, metadata);
    }

    return metadataList;
  } catch (error) {
    console.error(`Error fetching all Surah metadata: ${error}`);
    return [];
  }
}

/**
 * Verify that text matches official Quranic text
 */
export async function verifyQuranicText(
  surahNumber: number,
  verseNumber: number,
  textToVerify: string
): Promise<boolean> {
  try {
    const official = await getQuranicText(surahNumber, verseNumber, verseNumber);

    if (official.length === 0) {
      return false;
    }

    // Normalize texts for comparison (remove diacritics)
    const officialNormalized = normalizArabicText(official[0].arabic_text);
    const verifyNormalized = normalizArabicText(textToVerify);

    return officialNormalized === verifyNormalized;
  } catch (error) {
    console.error('Error verifying Quranic text:', error);
    return false;
  }
}

/**
 * Normalize Arabic text for comparison
 * Removes diacritical marks and standardizes characters
 */
export function normalizArabicText(text: string): string {
  // Remove Arabic diacritical marks
  const diacriticalMarks = /[ً-ْ]/g;
  let normalized = text.replace(diacriticalMarks, '');

  // Normalize Alef variants
  normalized = normalized.replace(/[أإا]/g, 'ا'); // All Alef variants to plain Alef

  // Normalize Yaa variants
  normalized = normalized.replace(/[ىي]/g, 'ي'); // Yaa variants to plain Yaa

  // Normalize Haa variants
  normalized = normalized.replace(/[ه]/g, 'ه'); // Normalize Haa

  // Remove extra spaces
  normalized = normalized.trim().replace(/\s+/g, ' ');

  return normalized;
}

/**
 * Get reference pronunciation timing from professional Qari
 * Uses Quran.com recitations as reference
 */
export async function getReferenceAudioTimings(
  surahNumber: number,
  verseNumber: number,
  reciterId: number = 5 // Default: Abdur Rahman As-Sudais (from Quran.com)
): Promise<Map<string, { start: number; end: number }> | null> {
  try {
    // Fetch timing information from Quran.com
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/${surahNumber}:${verseNumber}?recitation_id=${reciterId}&fields=audio`
    );

    if (!response.ok) {
      console.warn('Failed to fetch reference audio timings');
      return null;
    }

    const data: any = await response.json();

    if (!data.verse || !data.verse.audio) {
      console.warn('No audio data available');
      return null;
    }

    // Parse timing information if available
    const timings = new Map<string, { start: number; end: number }>();

    // Note: Quran.com API may not provide per-word timings in all cases
    // This is a placeholder for when such data becomes available

    return timings;
  } catch (error) {
    console.error('Error fetching reference audio timings:', error);
    return null;
  }
}

/**
 * Get reference audio URL for a verse
 */
export async function getReferenceAudioUrl(
  surahNumber: number,
  verseNumber: number,
  reciterId: number = 5 // Default: Abdur Rahman As-Sudais
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.quran.com/api/v4/verses/${surahNumber}:${verseNumber}?recitation_id=${reciterId}`
    );

    if (!response.ok) {
      return null;
    }

    const data: any = await response.json();

    if (data.verse && data.verse.audio) {
      return data.verse.audio.url;
    }

    return null;
  } catch (error) {
    console.error('Error fetching reference audio URL:', error);
    return null;
  }
}

/**
 * List available Qari (reciters) for reference
 */
export async function getAvailableRecitors(): Promise<{ id: number; name: string }[]> {
  try {
    const response = await fetch('https://api.quran.com/api/v4/recitations');

    if (!response.ok) {
      throw new Error('Failed to fetch recitations list');
    }

    const data: any = await response.json();

    if (!data.recitations) {
      throw new Error('No recitations data');
    }

    return data.recitations.map((rec: any) => ({
      id: rec.id,
      name: rec.reciter_name,
    }));
  } catch (error) {
    console.error('Error fetching available recitors:', error);
    return [];
  }
}

/**
 * Clear caches (useful for testing or memory management)
 */
export function clearCaches(): void {
  quranicTextCache.clear();
  surahMetadataCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStatistics(): { textCacheSize: number; metadataCacheSize: number } {
  return {
    textCacheSize: quranicTextCache.size,
    metadataCacheSize: surahMetadataCache.size,
  };
}
