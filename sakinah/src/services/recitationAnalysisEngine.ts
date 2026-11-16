/**
 * Recitation Analysis Engine
 * Main service for analyzing Quranic recitations
 */

import {
  RecitationReview,
  RecitationFinding,
  ReviewReport,
  AnalysisParams,
  QuranicVerse,
  AudioFeatures
} from '../types';

import {
  extractAudioFeatures,
  detectVoiceActivity,
  normalizeAudio,
  resampleAudio,
} from '../utils/audioProcessing';

import {
  detectWordBoundaries,
  compareWithQuranic,
  findMissingWords,
  findExtraWords,
  detectWordSubstitution,
  calculateRecitationAccuracy,
  calculatePhoneticDistance,
  DetectedWord,
  WordComparisonResult,
} from '../utils/wordMatching';

import {
  calculateMissingWordConfidence,
  calculateExtraWordConfidence,
  calculateWrongWordConfidence,
  calculatePronunciationErrorConfidence,
  calculateTajweedErrorConfidence,
  calculateOverallConfidence,
  flagInconclusiveCases,
  adjustConfidenceWithReference,
  assessFindingSeverity,
} from '../utils/confidenceScoring';

import {
  getQuranicText,
  getSurahMetadata,
  getReferenceAudioUrl,
  normalizArabicText,
} from './quranicTextDb';

/**
 * Main RecitationAnalysisService
 */
export class RecitationAnalysisService {
  private confidenceThreshold: number = 0.6;
  private minWordDuration: number = 0.2; // 200ms

  constructor(confidenceThreshold?: number) {
    if (confidenceThreshold) {
      this.confidenceThreshold = confidenceThreshold;
    }
  }

  /**
   * Main analysis function - orchestrates the entire analysis workflow
   */
  async analyzeRecitation(params: AnalysisParams): Promise<RecitationReview> {
    try {
      // 1. Download and prepare audio
      console.log('Step 1: Downloading and preparing audio...');
      const audioBuffer = await this.downloadAudio(params.audioUrl);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioData = await audioContext.decodeAudioData(audioBuffer);

      // Normalize and resample if needed
      const rawAudio = audioData.getChannelData(0);
      const normalizedAudio = normalizeAudio(new Float32Array(rawAudio));
      const resampledAudio = resampleAudio(normalizedAudio, audioData.sampleRate, 16000);

      // 2. Extract audio features
      console.log('Step 2: Extracting audio features...');
      const audioFeatures: AudioFeatures = {
        mfcc: [],
        energy: [],
        zero_crossing_rate: [],
        spectral_centroid: [],
        sample_rate: 16000,
        duration: audioData.duration,
      };

      // For now, use a simplified feature extraction
      // In production, would use the full extraction from audioProcessing.ts
      audioFeatures.energy = this.extractSimplifiedEnergy(resampledAudio);
      audioFeatures.zero_crossing_rate = this.extractSimplifiedZCR(resampledAudio);
      audioFeatures.spectral_centroid = new Array(audioFeatures.energy.length).fill(2000);
      audioFeatures.mfcc = new Array(audioFeatures.energy.length).fill(new Array(13).fill(0));

      // 3. Detect voice activity
      console.log('Step 3: Detecting voice activity...');
      const voiceSegments = detectVoiceActivity(
        audioFeatures.energy,
        audioFeatures.zero_crossing_rate
      );

      // 4. Detect word boundaries
      console.log('Step 4: Detecting word boundaries...');
      const detectedWords = detectWordBoundaries(audioFeatures, voiceSegments, this.minWordDuration);

      // 5. Get Quranic text
      console.log('Step 5: Retrieving Quranic text...');
      const quranicVerses = await getQuranicText(
        params.surahNumber,
        params.verseStart,
        params.verseEnd
      );

      if (quranicVerses.length === 0) {
        throw new Error('Could not retrieve Quranic text');
      }

      // 6. Compare detected words with Quranic text
      console.log('Step 6: Comparing detected words with Quranic text...');
      const wordComparisons = compareWithQuranic(detectedWords, quranicVerses);

      // 7. Identify errors
      console.log('Step 7: Identifying errors...');
      const missingWords = findMissingWords(wordComparisons);
      const extraWords = findExtraWords(wordComparisons);
      const wrongWords = detectWordSubstitution(wordComparisons);

      // 8. Build findings
      console.log('Step 8: Building findings...');
      const findings: RecitationFinding[] = [];
      const findingConfidences: number[] = [];

      // Add missing word findings
      for (const missing of missingWords) {
        const confidenceResult = calculateMissingWordConfidence(0.3, []);

        findings.push({
          id: `finding_${findings.length + 1}`,
          word_number: missing.word_number,
          verse_number: missing.verse_number,
          word_text: missing.word_transliteration,
          word_arabic: missing.word_arabic,
          start_time: 0,
          end_time: 0,
          duration: 0,
          type: 'missing_word',
          severity: confidenceResult.severity,
          confidence: confidenceResult.confidence,
          expected: missing.word_arabic,
          detected: '',
          description_ar: `الكلمة "${missing.word_arabic}" مفقودة من التلاوة`,
          description_en: `The word "${missing.word_transliteration}" is missing from the recitation`,
          suggestions: [
            'Repeat this verse and ensure all words are pronounced',
            'Compare with reference pronunciation',
          ],
        });

        findingConfidences.push(confidenceResult.confidence);
      }

      // Add extra word findings
      for (const extra of extraWords) {
        const confidenceResult = calculateExtraWordConfidence(
          extra.duration,
          0.5,
          1
        );

        findings.push({
          id: `finding_${findings.length + 1}`,
          word_number: extra.word_index,
          verse_number: params.verseStart,
          word_text: `Extra word at ${extra.start_time.toFixed(2)}s`,
          word_arabic: 'كلمة إضافية',
          start_time: extra.start_time,
          end_time: extra.end_time,
          duration: extra.duration,
          type: 'extra_word',
          severity: confidenceResult.severity,
          confidence: confidenceResult.confidence,
          expected: 'No word',
          detected: `Detected at ${extra.start_time.toFixed(2)}s`,
          description_ar: 'تم كشف كلمة إضافية لم تكن في النص القرآني',
          description_en: 'An extra word was detected that is not in the Quranic text',
          suggestions: [
            'Review the detected extra word',
            'Check if it\'s part of the original recitation',
          ],
        });

        findingConfidences.push(confidenceResult.confidence);
      }

      // Add wrong word findings
      for (const wrong of wrongWords) {
        const confidenceResult = calculateWrongWordConfidence(
          wrong.match_confidence,
          0.8,
          'moderate'
        );

        findings.push({
          id: `finding_${findings.length + 1}`,
          word_number: wrong.word_number,
          verse_number: wrong.verse_number,
          word_text: wrong.expected_transliteration,
          word_arabic: wrong.expected_arabic,
          start_time: 0,
          end_time: 0,
          duration: 0,
          type: 'wrong_word',
          severity: confidenceResult.severity,
          confidence: confidenceResult.confidence,
          expected: wrong.expected_arabic,
          detected: `Different word (confidence: ${(wrong.match_confidence * 100).toFixed(1)}%)`,
          description_ar: `كلمة مختلفة عن المتوقع: "${wrong.expected_arabic}"`,
          description_en: `Different word than expected: "${wrong.expected_transliteration}"`,
          suggestions: [
            `Compare with reference pronunciation of "${wrong.expected_transliteration}"`,
            'Practice the correct pronunciation',
          ],
        });

        findingConfidences.push(confidenceResult.confidence);
      }

      // 9. Calculate accuracy metrics
      const totalQuranicWords = quranicVerses.reduce((sum, v) => sum + v.word_count, 0);
      const accuracy = calculateRecitationAccuracy(wordComparisons, totalQuranicWords);

      // 10. Calculate overall confidence
      const overallConfidence = calculateOverallConfidence(
        findingConfidences,
        accuracy,
        missingWords.length,
        extraWords.length,
        wrongWords.length,
        totalQuranicWords
      );

      // 11. Flag inconclusive cases
      const humanReviewFlags = flagInconclusiveCases(findings);

      // 12. Generate report
      console.log('Step 12: Generating report...');
      const finalReport = this.generateReport(
        findings,
        accuracy,
        totalQuranicWords,
        missingWords.length,
        extraWords.length,
        wrongWords.length,
        quranicVerses[0]?.surah_number || params.surahNumber
      );

      // 13. Get Surah metadata
      const surahMetadata = await getSurahMetadata(params.surahNumber);

      // 14. Compile review
      const review: RecitationReview = {
        id: `review_${Date.now()}`,
        project_id: params.projectId,
        audio_file_id: params.audioFileId,
        surah_number: params.surahNumber,
        surah_name_ar: surahMetadata?.name_ar || 'Unknown',
        surah_name_en: surahMetadata?.name_en || 'Unknown',
        verses_range: {
          start: params.verseStart,
          end: params.verseEnd,
        },
        findings,
        overall_confidence: overallConfidence,
        total_words_analyzed: totalQuranicWords,
        total_errors_found: findings.filter(f => f.severity === 'error').length,
        final_report: finalReport,
        status: 'completed',
        analysis_timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Analysis complete!');
      return review;
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download audio from URL
   */
  private async downloadAudio(audioUrl: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.statusText}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      throw new Error(`Audio download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Simplified energy extraction (for initial implementation)
   */
  private extractSimplifiedEnergy(audioData: Float32Array): number[] {
    const frameLength = 512;
    const frameShift = 256;
    const energy: number[] = [];

    for (let i = 0; i < audioData.length - frameLength; i += frameShift) {
      let sum = 0;
      for (let j = 0; j < frameLength; j++) {
        sum += audioData[i + j] * audioData[i + j];
      }
      energy.push(Math.sqrt(sum / frameLength));
    }

    return energy;
  }

  /**
   * Simplified ZCR extraction (for initial implementation)
   */
  private extractSimplifiedZCR(audioData: Float32Array): number[] {
    const frameLength = 512;
    const frameShift = 256;
    const zcr: number[] = [];

    for (let i = 0; i < audioData.length - frameLength; i += frameShift) {
      let zcrCount = 0;
      for (let j = 1; j < frameLength; j++) {
        if ((audioData[i + j] >= 0 && audioData[i + j - 1] < 0) ||
            (audioData[i + j] < 0 && audioData[i + j - 1] >= 0)) {
          zcrCount++;
        }
      }
      zcr.push(zcrCount / (2 * frameLength));
    }

    return zcr;
  }

  /**
   * Generate report from findings
   */
  private generateReport(
    findings: RecitationFinding[],
    accuracy: number,
    totalWords: number,
    missingCount: number,
    extraCount: number,
    wrongCount: number,
    surahNumber: number
  ): ReviewReport {
    const errorFindings = findings.filter(f => f.severity === 'error');
    const probableFindings = findings.filter(f => f.severity === 'probable');
    const inconclusiveFindings = findings.filter(f => f.severity === 'inconclusive');

    // Count by type
    const byType: Record<string, number> = {};
    for (const finding of findings) {
      byType[finding.type] = (byType[finding.type] || 0) + 1;
    }

    // Generate recommendations
    const recommendations_en: string[] = [];
    const recommendations_ar: string[] = [];

    if (accuracy > 95) {
      recommendations_en.push('Excellent recitation! Continue practicing to maintain perfection.');
      recommendations_ar.push('تلاوة رائعة! استمر في المراجعة والممارسة المستمرة.');
    } else if (accuracy > 85) {
      recommendations_en.push('Good recitation with minor issues. Focus on the identified errors.');
      recommendations_ar.push('تلاوة جيدة مع أخطاء قليلة. ركز على الأخطاء المحددة.');
    } else {
      recommendations_en.push('Practice the identified errors with the reference pronunciation.');
      recommendations_ar.push('مارس الأخطاء المحددة مع الاستماع إلى النطق الصحيح.');
    }

    if (missingCount > 0) {
      recommendations_en.push(`Review the ${missingCount} missing word(s) carefully.`);
      recommendations_ar.push(`اراجع الكلمات الـ ${missingCount} المفقودة بعناية.`);
    }

    recommendations_en.push('Listen to reference recitation regularly for comparison.');
    recommendations_ar.push('استمع إلى التلاوات المرجعية بانتظام للمقارنة.');

    // Calculate performance metrics
    const clarityScore = Math.min(100, accuracy + 5); // Slight boost for detected issues
    const tajweedScore = Math.max(0, 100 - (errorFindings.length * 10)); // Deduct for errors

    return {
      summary_ar: `تلاوتك لسورة عددها ${surahNumber} بدقة ${accuracy.toFixed(1)}%. تم العثور على ${errorFindings.length} أخطاء مؤكدة و${probableFindings.length} أخطاء محتملة.`,
      summary_en: `Your recitation of Surah ${surahNumber} has an accuracy of ${accuracy.toFixed(1)}%. ${errorFindings.length} confirmed error(s) and ${probableFindings.length} probable issue(s) were found.`,

      total_words: totalWords,
      words_with_issues: findings.length,
      accuracy_percentage: accuracy,

      errors: {
        confirmed: errorFindings.length,
        probable: probableFindings.length,
        inconclusive: inconclusiveFindings.length,
      },

      by_type: byType,
      by_tajweed_rule: {},

      recommendations_ar,
      recommendations_en,

      performance_metrics: {
        clarity: clarityScore,
        accuracy: Math.min(100, accuracy),
        tajweed_application: tajweedScore,
      },

      generated_at: new Date().toISOString(),
    };
  }
}

/**
 * Export singleton instance
 */
export const recitationAnalysisService = new RecitationAnalysisService();
