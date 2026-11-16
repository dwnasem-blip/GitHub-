/**
 * Word Matching Utilities for Quranic Recitation Analysis
 * Handles word boundary detection, text comparison, and error detection
 */

import { AudioFeatures, QuranicWord, QuranicVerse } from '../types';

/**
 * Result of word boundary detection
 */
export interface DetectedWord {
  word_index: number;
  start_time: number;
  end_time: number;
  duration: number;
  confidence: number;
  phonetic_features: number[];
}

/**
 * Detect word boundaries from audio features
 * Uses energy and zero-crossing rate to identify word boundaries
 */
export function detectWordBoundaries(
  audioFeatures: AudioFeatures,
  voiceSegments: Array<{ start: number; end: number }>,
  minWordDuration: number = 0.2 // 200ms minimum word duration
): DetectedWord[] {
  const detectedWords: DetectedWord[] = [];
  const frameShift = 0.01; // 10ms

  let wordIndex = 0;

  for (const segment of voiceSegments) {
    const segmentFrameStart = Math.floor(segment.start / frameShift);
    const segmentFrameEnd = Math.ceil(segment.end / frameShift);

    let inWord = false;
    let wordStart = segment.start;
    let wordEnergy: number[] = [];
    let wordZcr: number[] = [];
    let wordMfcc: number[][] = [];

    for (let i = segmentFrameStart; i < segmentFrameEnd; i++) {
      if (i >= audioFeatures.energy.length) break;

      const energy = audioFeatures.energy[i];
      const zcr = audioFeatures.zero_crossing_rate[i];
      const isVoiced = energy > 0.01 && zcr < 0.15;

      if (isVoiced) {
        if (!inWord) {
          wordStart = i * frameShift;
          inWord = true;
        }
        wordEnergy.push(energy);
        wordZcr.push(zcr);
        if (i < audioFeatures.mfcc.length) {
          wordMfcc.push(audioFeatures.mfcc[i]);
        }
      } else if (inWord) {
        // End of word
        const wordDuration = (i * frameShift) - wordStart;

        if (wordDuration >= minWordDuration) {
          const confidence = calculateWordBoundaryConfidence(wordEnergy, wordZcr);

          detectedWords.push({
            word_index: wordIndex,
            start_time: wordStart,
            end_time: i * frameShift,
            duration: wordDuration,
            confidence,
            phonetic_features: extractWordFeatures(wordMfcc),
          });

          wordIndex++;
        }

        inWord = false;
        wordEnergy = [];
        wordZcr = [];
        wordMfcc = [];
      }
    }

    // Handle case where word extends to end of segment
    if (inWord) {
      const wordDuration = segment.end - wordStart;
      if (wordDuration >= minWordDuration) {
        const confidence = calculateWordBoundaryConfidence(wordEnergy, wordZcr);

        detectedWords.push({
          word_index: wordIndex,
          start_time: wordStart,
          end_time: segment.end,
          duration: wordDuration,
          confidence,
          phonetic_features: extractWordFeatures(wordMfcc),
        });

        wordIndex++;
      }
    }
  }

  return detectedWords;
}

/**
 * Calculate confidence of word boundary detection
 */
function calculateWordBoundaryConfidence(energy: number[], zcr: number[]): number {
  if (energy.length === 0) return 0;

  // Higher energy and lower ZCR indicate clearer word boundary
  const avgEnergy = energy.reduce((a, b) => a + b, 0) / energy.length;
  const avgZcr = zcr.reduce((a, b) => a + b, 0) / zcr.length;

  // Normalize to 0-1 range
  const energyScore = Math.min(avgEnergy / 0.1, 1);
  const zcrScore = 1 - Math.min(avgZcr / 0.3, 1);

  return (energyScore + zcrScore) / 2;
}

/**
 * Extract averaged phonetic features for a word
 */
function extractWordFeatures(mfccFrames: number[][]): number[] {
  if (mfccFrames.length === 0) return new Array(13).fill(0);

  const numCoefficients = mfccFrames[0].length;
  const averagedFeatures: number[] = new Array(numCoefficients).fill(0);

  for (const frame of mfccFrames) {
    for (let i = 0; i < numCoefficients; i++) {
      averagedFeatures[i] += frame[i];
    }
  }

  for (let i = 0; i < numCoefficients; i++) {
    averagedFeatures[i] /= mfccFrames.length;
  }

  return averagedFeatures;
}

/**
 * Compare detected words with expected Quranic text
 */
export interface WordComparisonResult {
  expected_word: QuranicWord;
  detected_word?: DetectedWord;
  match_confidence: number;
  is_match: boolean;
  error_type?: 'missing_word' | 'extra_word' | 'wrong_word';
}

/**
 * Compare detected words with Quranic verses
 */
export function compareWithQuranic(
  detectedWords: DetectedWord[],
  quranicVerses: QuranicVerse[]
): WordComparisonResult[] {
  const comparisons: WordComparisonResult[] = [];
  const allQuranicWords: Array<QuranicWord & { verse_number: number }> = [];

  // Collect all Quranic words
  for (const verse of quranicVerses) {
    for (const word of verse.words) {
      allQuranicWords.push({
        ...word,
        verse_number: verse.verse_number,
      });
    }
  }

  let detectedIndex = 0;

  for (const quranicWord of allQuranicWords) {
    if (detectedIndex < detectedWords.length) {
      const detectedWord = detectedWords[detectedIndex];
      const matchConfidence = calculateWordSimilarity(
        detectedWord.phonetic_features,
        quranicWord.arabic
      );

      if (matchConfidence > 0.65) {
        // Match found
        comparisons.push({
          expected_word: quranicWord,
          detected_word: detectedWord,
          match_confidence: matchConfidence,
          is_match: true,
        });
        detectedIndex++;
      } else {
        // Potential missing word
        comparisons.push({
          expected_word: quranicWord,
          match_confidence: 0,
          is_match: false,
          error_type: 'missing_word',
        });
      }
    } else {
      // All detected words processed, remaining are missing
      comparisons.push({
        expected_word: quranicWord,
        match_confidence: 0,
        is_match: false,
        error_type: 'missing_word',
      });
    }
  }

  // Handle extra words at the end
  while (detectedIndex < detectedWords.length) {
    comparisons.push({
      expected_word: {
        word_number: -1,
        arabic: 'EXTRA',
        transliteration: 'extra',
      },
      detected_word: detectedWords[detectedIndex],
      match_confidence: 0,
      is_match: false,
      error_type: 'extra_word',
    });
    detectedIndex++;
  }

  return comparisons;
}

/**
 * Calculate similarity between detected phonetic features and expected word
 * Uses a simplified phonetic matching algorithm
 */
function calculateWordSimilarity(phoneticalFeatures: number[], expectedWord: string): number {
  // This is a simplified version - in production, would use speech recognition API
  // or more sophisticated phonetic matching

  // For now, use a baseline confidence based on feature consistency
  if (phoneticalFeatures.length === 0) return 0;

  // Calculate variance of features
  let mean = 0;
  for (const feature of phoneticalFeatures) {
    mean += Math.abs(feature);
  }
  mean /= phoneticalFeatures.length;

  // Higher variance suggests stronger phonetic patterns
  const variance = phoneticalFeatures.reduce((sum, f) => sum + Math.pow(Math.abs(f) - mean, 2), 0) /
    phoneticalFeatures.length;

  // Normalize variance to 0-1 confidence range
  return Math.min(Math.sqrt(variance) / 50, 1) * 0.8 + 0.2; // Confidence between 0.2 and 1.0
}

/**
 * Find missing words in recitation
 */
export interface MissingWord {
  word_number: number;
  verse_number: number;
  word_arabic: string;
  word_transliteration: string;
  expected_time_location: string;
}

/**
 * Identify missing words based on word comparisons
 */
export function findMissingWords(
  comparisons: WordComparisonResult[],
  minimumConfidenceThreshold: number = 0.65
): MissingWord[] {
  const missingWords: MissingWord[] = [];

  for (const comparison of comparisons) {
    if (comparison.error_type === 'missing_word') {
      missingWords.push({
        word_number: comparison.expected_word.word_number,
        verse_number: (comparison.expected_word as any).verse_number,
        word_arabic: comparison.expected_word.arabic,
        word_transliteration: comparison.expected_word.transliteration,
        expected_time_location: 'between matched words',
      });
    }
  }

  return missingWords;
}

/**
 * Find extra words in recitation
 */
export interface ExtraWord {
  word_index: number;
  start_time: number;
  end_time: number;
  duration: number;
}

/**
 * Identify extra words based on word comparisons
 */
export function findExtraWords(
  comparisons: WordComparisonResult[]
): ExtraWord[] {
  const extraWords: ExtraWord[] = [];

  for (const comparison of comparisons) {
    if (comparison.error_type === 'extra_word' && comparison.detected_word) {
      extraWords.push({
        word_index: comparison.detected_word.word_index,
        start_time: comparison.detected_word.start_time,
        end_time: comparison.detected_word.end_time,
        duration: comparison.detected_word.duration,
      });
    }
  }

  return extraWords;
}

/**
 * Detect word substitution errors
 */
export interface WordSubstitution {
  word_number: number;
  verse_number: number;
  expected_arabic: string;
  expected_transliteration: string;
  detected_index: number;
  match_confidence: number;
}

/**
 * Identify wrong words (substitutions)
 */
export function detectWordSubstitution(
  comparisons: WordComparisonResult[],
  minimumConfidenceThreshold: number = 0.65
): WordSubstitution[] {
  const substitutions: WordSubstitution[] = [];

  for (const comparison of comparisons) {
    if (!comparison.is_match &&
        comparison.detected_word &&
        comparison.match_confidence > 0 &&
        comparison.match_confidence < minimumConfidenceThreshold) {

      substitutions.push({
        word_number: comparison.expected_word.word_number,
        verse_number: (comparison.expected_word as any).verse_number,
        expected_arabic: comparison.expected_word.arabic,
        expected_transliteration: comparison.expected_word.transliteration,
        detected_index: comparison.detected_word.word_index,
        match_confidence: comparison.match_confidence,
      });
    }
  }

  return substitutions;
}

/**
 * Calculate overall accuracy of recitation
 */
export function calculateRecitationAccuracy(
  comparisons: WordComparisonResult[],
  totalQuranicWords: number
): number {
  const matchedWords = comparisons.filter(c => c.is_match).length;
  return totalQuranicWords > 0 ? (matchedWords / totalQuranicWords) * 100 : 0;
}

/**
 * Phonetic distance between two words (simplified)
 * Used for pronunciation error detection
 */
export function calculatePhoneticDistance(
  features1: number[],
  features2: number[]
): number {
  if (features1.length !== features2.length) {
    return 1; // Maximum distance if different lengths
  }

  let sumSquareDiff = 0;
  for (let i = 0; i < features1.length; i++) {
    sumSquareDiff += Math.pow(features1[i] - features2[i], 2);
  }

  // Normalize to 0-1 range
  const euclideanDistance = Math.sqrt(sumSquareDiff);
  return Math.min(euclideanDistance / 10, 1); // Assuming max reasonable distance is 10
}
