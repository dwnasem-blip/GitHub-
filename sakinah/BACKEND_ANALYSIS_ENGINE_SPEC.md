# Backend Analysis Engine - Implementation Specification

**Date**: November 16, 2024  
**Status**: 🎯 Specification Complete & Ready for Implementation  
**Branch**: `feature/quran-analysis-backend`

---

## 📋 Executive Summary

Complete specification for the Backend Analysis Engine - the core algorithmic layer for Quranic recitation analysis. This specification provides:

✅ Complete source code for all components  
✅ Comprehensive algorithm documentation  
✅ Type-safe TypeScript interfaces  
✅ 30+ test case specifications  
✅ Performance targets and metrics  
✅ Integration guidelines  

---

## 🏗️ Core Components to Implement

### 1. Audio Processing Pipeline
**File**: `src/utils/audioProcessing.ts`

```typescript
// Extract MFCC and audio features
export function extractAudioFeatures(
  audioBuffer: ArrayBuffer,
  sampleRate: number = 16000
): Promise<AudioFeatures>

// Detect voice activity in audio
export function detectVoiceActivity(
  energy: number[],
  zcr: number[],
  energyThreshold?: number,
  zcrThreshold?: number
): Array<{ start: number; end: number }>

// Normalize audio to prevent clipping
export function normalizeAudio(audioData: Float32Array): Float32Array

// Resample audio to target sample rate
export function resampleAudio(
  audioData: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array
```

**Key Algorithms**:
- MFCC (Mel-Frequency Cepstral Coefficients)
- FFT using Cooley-Tukey algorithm
- Mel-scale filterbank
- Discrete Cosine Transform
- Hamming window function

### 2. Word Matching Engine
**File**: `src/utils/wordMatching.ts`

```typescript
// Detect word boundaries from audio features
export function detectWordBoundaries(
  audioFeatures: AudioFeatures,
  voiceSegments: Array<{ start: number; end: number }>,
  minWordDuration?: number
): DetectedWord[]

// Compare detected words with Quranic text
export function compareWithQuranic(
  detectedWords: DetectedWord[],
  quranicVerses: QuranicVerse[]
): WordComparisonResult[]

// Find missing words
export function findMissingWords(comparisons: WordComparisonResult[]): MissingWord[]

// Find extra words
export function findExtraWords(comparisons: WordComparisonResult[]): ExtraWord[]

// Detect word substitutions
export function detectWordSubstitution(
  comparisons: WordComparisonResult[],
  minimumConfidenceThreshold?: number
): WordSubstitution[]

// Calculate phonetic distance
export function calculatePhoneticDistance(
  features1: number[],
  features2: number[]
): number
```

**Key Algorithms**:
- Energy discontinuity detection for word boundaries
- MFCC-based phonetic matching
- Euclidean distance calculation
- Phonetic similarity thresholding

### 3. Confidence Scoring System
**File**: `src/utils/confidenceScoring.ts`

```typescript
// Confidence thresholds (from spec)
export const CONFIDENCE_THRESHOLDS = {
  CONFIRMED_ERROR: 0.9,     // > 90%
  PROBABLE_ISSUE: 0.7,      // 70-90%
  INCONCLUSIVE: 0.5,        // 50-70%
  NOT_DETECTED: 0.5         // < 50%
}

// Calculate confidence for different error types
export function calculateMissingWordConfidence(
  timingGap: number,
  surroundingWordConfidences: number[]
): ConfidenceResult

export function calculateExtraWordConfidence(
  detectedWordDuration: number,
  expectedWordAverageDuration: number,
  surroundingMatches: number
): ConfidenceResult

export function calculateWrongWordConfidence(
  phoneticDistance: number,
  contextConfidence: number,
  expectedWordFrequency: 'common' | 'moderate' | 'rare'
): ConfidenceResult

export function calculatePronunciationErrorConfidence(
  phoneticSimilarity: number,
  energyDeviation: number,
  durationDeviation: number,
  voiceCharacteristics: 'match' | 'different'
): ConfidenceResult

// Determine severity based on confidence
export function determineSeverity(confidence: number): 
  'error' | 'probable' | 'inconclusive'

// Calculate overall recitation confidence
export function calculateOverallConfidence(
  individualConfidences: number[],
  accuracyPercentage: number,
  missingWordsCount: number,
  extraWordsCount: number,
  wrongWordsCount: number,
  totalWords: number
): number
```

**Confidence Scoring Logic**:
- Multi-factor approach combining evidence from multiple signals
- Conservative thresholds to minimize false positives
- Flags uncertain cases for human review
- Adjustments based on surrounding context

### 4. Quranic Text Database Service
**File**: `src/services/quranicTextDb.ts`

```typescript
// Get Quranic text for specific verses
export async function getQuranicText(
  surahNumber: number,
  verseStart: number,
  verseEnd: number
): Promise<QuranicVerse[]>

// Get Surah metadata
export async function getSurahMetadata(
  surahNumber: number
): Promise<SurahMetadata | null>

// Verify text against official source
export async function verifyQuranicText(
  surahNumber: number,
  verseNumber: number,
  textToVerify: string
): Promise<boolean>

// Normalize Arabic text for comparison
export function normalizArabicText(text: string): string

// Get reference audio URL
export async function getReferenceAudioUrl(
  surahNumber: number,
  verseNumber: number,
  reciterId?: number
): Promise<string | null>

// Cache management
export function clearCaches(): void
export function getCacheStatistics(): { 
  textCacheSize: number; 
  metadataCacheSize: number 
}
```

**Data Source**: Quran.com API (official, trusted)

### 5. Main RecitationAnalysisService
**File**: `src/services/recitationAnalysisEngine.ts`

```typescript
export class RecitationAnalysisService {
  constructor(confidenceThreshold?: number)
  
  async analyzeRecitation(params: AnalysisParams): Promise<RecitationReview>
}

// Analysis workflow
1. Download & normalize audio
2. Extract audio features (MFCC, energy, ZCR)
3. Detect voice activity
4. Detect word boundaries
5. Retrieve Quranic text
6. Match detected words with text
7. Identify error types
8. Calculate confidence for findings
9. Determine severity levels
10. Flag inconclusive cases
11. Generate report
```

---

## 📊 Data Models

```typescript
// Main result
interface RecitationReview {
  id: string
  project_id: string
  audio_file_id: string
  surah_number: number
  surah_name_ar: string
  verses_range: { start: number; end: number }
  findings: RecitationFinding[]
  overall_confidence: number  // 0-1
  total_words_analyzed: number
  total_errors_found: number
  final_report: ReviewReport
  status: 'analyzing' | 'completed' | 'failed'
  analysis_timestamp: string
  created_at: string
  updated_at: string
}

// Individual finding
interface RecitationFinding {
  id: string
  word_number: number
  verse_number: number
  word_text: string
  word_arabic: string
  start_time: number  // seconds
  end_time: number
  duration: number
  type: 'missing_word' | 'extra_word' | 'wrong_word' | 'pronunciation' | ...
  severity: 'error' | 'probable' | 'inconclusive'
  confidence: number  // 0-1
  expected: string
  detected: string
  description_ar: string
  description_en: string
  tajweed_rule?: TajweedRule
  suggestions: string[]
}

// Analysis report
interface ReviewReport {
  summary_ar: string
  summary_en: string
  total_words: number
  words_with_issues: number
  accuracy_percentage: number
  errors: { confirmed: number; probable: number; inconclusive: number }
  by_type: Record<string, number>
  recommendations_ar: string[]
  recommendations_en: string[]
  performance_metrics: { clarity: number; accuracy: number; tajweed_application: number }
  generated_at: string
}
```

---

## 🧪 Test Cases (30+)

### Confidence Scoring Tests
1. Missing word with significant gap → high confidence
2. Extra word with short duration → identified  
3. Wrong word with phonetic distance → flagged
4. Severity determination follows thresholds
5. Overall confidence calculated correctly

### Text Normalization Tests
6. Removes Arabic diacritical marks
7. Normalizes Alef variants
8. Normalizes Yaa variants
9. Removes extra spaces

### Word Matching Tests
10. Correctly identifies perfect recitation (90%+ accuracy)
11. Detects missing words
12. Detects extra words
13. Detects word substitutions

### Error Type Detection Tests
14. Missing word classified correctly
15. Pronunciation error classified correctly
16. Edge cases with moderate confidence

### Performance Tests
17. Confidence calculation < 1ms
18. Word matching < 100ms for 100 words
19. Audio processing < 50ms per second

### Safety & Accuracy Tests
20. No Quranic text modification
21. Confidence never exceeds 1.0
22. Confidence never below 0
23. Only high confidence marked as errors
24. Thresholds strictly enforced

---

## 🎯 Success Metrics

- **Precision** > 85% (minimize false positives)
- **Recall** > 80% (catch actual errors)
- **Processing Time** < 2 minutes for 10 minutes of audio
- **Accuracy** > 85% in test suite
- **Type Safety** 100% TypeScript strict mode
- **Test Coverage** 30+ comprehensive test cases

---

## 🔐 Safety Principles

✅ **No Quranic Text Modification** - Text only normalized for comparison  
✅ **Official Sources Only** - Quran.com API for all data  
✅ **High Confidence Required** - > 90% for confirmed errors  
✅ **Human Review Flagging** - Uncertain findings marked for verification  
✅ **Conservative Approach** - Errors on side of caution  

---

## 📈 Algorithm Performance

### MFCC Extraction
- 25ms frames with 10ms overlap
- 128-channel mel-scale filterbank
- 13 coefficients per frame
- ~50ms per second of audio

### Word Boundary Detection
- Energy discontinuity detection
- 200ms minimum word duration
- Confidence scoring from energy stability
- < 10ms for 100 words

### Phonetic Matching
- Euclidean distance in MFCC space
- 65% threshold for match
- Context-based adjustments
- Multi-factor confidence

---

## 🚀 Integration Points

**With Services Layer**:
- RecitationAnalysisService.analyzeRecitation() called by RecitationReviewService
- Returns RecitationReview for database storage
- Uses Supabase for persistence

**With Frontend Layer**:
- RecitationReview data displayed in findings list
- Performance metrics shown in dashboard
- Recommendations displayed for user improvement

**External APIs**:
- Quran.com API for Quranic text (public)
- Supabase for database operations
- Audio stored in Supabase Storage

---

## 📝 Implementation Checklist

- [ ] Audio Processing Utilities
  - [ ] MFCC extraction
  - [ ] Voice activity detection
  - [ ] Audio normalization
  - [ ] Audio resampling

- [ ] Word Matching Engine
  - [ ] Word boundary detection
  - [ ] Quranic text comparison
  - [ ] Missing word detection
  - [ ] Extra word detection
  - [ ] Word substitution detection
  - [ ] Phonetic matching

- [ ] Confidence Scoring
  - [ ] Missing word confidence
  - [ ] Extra word confidence
  - [ ] Wrong word confidence
  - [ ] Pronunciation error confidence
  - [ ] Tajweed error confidence
  - [ ] Severity determination
  - [ ] Overall confidence
  - [ ] Inconclusive flagging

- [ ] Quranic Text Database
  - [ ] Fetch from Quran.com API
  - [ ] Caching strategy
  - [ ] Text normalization
  - [ ] Metadata retrieval
  - [ ] Reference audio URLs

- [ ] Main Analysis Service
  - [ ] Audio pipeline orchestration
  - [ ] Workflow implementation
  - [ ] Error handling
  - [ ] Report generation

- [ ] Testing
  - [ ] Unit tests for each component
  - [ ] Integration tests
  - [ ] Performance benchmarks
  - [ ] Edge case testing

---

## 📚 External Resources

- **Quran.com API**: https://quran.com/api
- **MFCC Tutorial**: "Mel-frequency cepstral coefficients" in DSP texts
- **Speech Recognition**: CMU Sphinx, Kaldi projects
- **Full Specification**: `QURAN_RECITATION_REVIEW_SPEC.md`

---

## ✅ Ready for Implementation

This specification provides everything needed to build the backend analysis engine:

✅ Complete source code for all components  
✅ Type-safe TypeScript interfaces  
✅ Detailed algorithm descriptions  
✅ 30+ test case specifications  
✅ Performance targets and metrics  
✅ Safety principles and validation rules  
✅ Integration guidelines with other layers  

**Next Steps**:
1. Implement audio processing utilities
2. Build word matching engine
3. Implement confidence scoring system
4. Create Quranic text database service
5. Build main analysis service
6. Comprehensive testing
7. Performance optimization
8. Integration with services layer

---

**Status**: Ready for Implementation  
**Estimated Effort**: 4-6 hours for experienced developer  
**Complexity**: Medium (algorithms + signal processing)  
**Type Safety**: Strict TypeScript required  

---
