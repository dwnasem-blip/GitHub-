# QURAN RECITATION REVIEW - Intelligent Analysis System
# مراجع التلاوة الذكي - نظام التحليل الذكي

**Version**: 1.0  
**Status**: 🚀 Ready for Development  
**Priority**: HIGH - Core Feature  
**Estimated Effort**: 15-20 days (3 agents, parallel)

---

## 🎯 Feature Overview

**Purpose**: Analyze Quranic recitations to detect and report errors, helping users improve their Quranic reading with professional feedback.

**Key Principle**: Provide accurate analysis without modifying Quranic text or making definitive Tajweed judgments that require human expertise.

---

## 📊 Data Models

### RecitationReview
```typescript
interface RecitationReview {
  id: string;
  project_id: string;
  audio_file_id: string;
  surah_number: number;
  surah_name_ar: string;
  verses_range: {
    start: number;
    end: number;
  };
  
  // Analysis results
  findings: RecitationFinding[];
  overall_confidence: number; // 0-1
  total_words_analyzed: number;
  total_errors_found: number;
  
  // References
  reference_audio_url?: string;
  reference_reader?: string;
  
  // Report
  final_report: ReviewReport;
  
  // Status
  status: 'analyzing' | 'completed' | 'failed';
  analysis_timestamp: string;
  created_at: string;
  updated_at: string;
}

interface RecitationFinding {
  id: string;
  word_number: number; // Position in Surah
  verse_number: number;
  word_text: string;
  word_arabic: string;
  
  // Timing
  start_time: number; // seconds
  end_time: number;
  duration: number;
  
  // Error classification
  type: 'missing_word' | 'extra_word' | 'wrong_word' | 
        'pronunciation' | 'tajweed' | 'elongation' | 'nasalization' | 
        'assimilation' | 'concealment' | 'manifestation' | 'vibration';
  
  severity: 'error' | 'probable' | 'inconclusive';
  confidence: number; // 0-1
  
  // Description
  expected: string; // What was expected
  detected: string; // What was detected
  description_ar: string; // Arabic explanation
  description_en: string; // English explanation
  
  // Tajweed info (if applicable)
  tajweed_rule?: {
    name_ar: string;
    name_en: string;
    rule_description: string;
    is_definitive: boolean; // false if needs human review
  };
  
  // Suggestions
  suggestions: string[];
  reference_audio_segment?: string; // URL to reference audio for this word
}

interface ReviewReport {
  summary_ar: string;
  summary_en: string;
  
  total_words: number;
  words_with_issues: number;
  accuracy_percentage: number;
  
  errors: {
    confirmed: number;
    probable: number;
    inconclusive: number;
  };
  
  by_type: Record<string, number>; // Count by error type
  by_tajweed_rule: Record<string, number>; // Count by Tajweed rule
  
  recommendations_ar: string[];
  recommendations_en: string[];
  
  performance_metrics: {
    clarity: number; // 0-100
    accuracy: number; // 0-100
    tajweed_application: number; // 0-100
  };
  
  generated_at: string;
}
```

---

## 🏗️ Architecture

### Component Stack

```
RecitationReviewScreen
├── AudioPlayer (Display + Play Original)
├── ReferenceAudioPlayer (Optional - Play Reference)
├── FindingsList
│   ├── FilterBar
│   │   ├── By Type
│   │   ├── By Severity
│   │   └── By Time Range
│   └── FindingCard (Repeating)
│       ├── WordDisplay
│       ├── ErrorInfo
│       ├── Confidence Badge
│       ├── PlaySegmentButton
│       └── TajweedInfo
└── FinalReportSection
    ├── SummaryMetrics
    ├── ErrorBreakdown
    ├── Recommendations
    └── SaveReportButton
```

### Service Architecture

```
RecitationAnalysisService
├── audioProcessing()
│   ├── extractAudioFeatures()
│   ├── detectVoiceActivity()
│   └── normalizeAudio()
│
├── wordMatching()
│   ├── detectWordBoundaries()
│   ├── compareWithQuranic()
│   ├── findMissingWords()
│   ├── findExtraWords()
│   └── detectWordSubstitution()
│
├── pronunciationAnalysis()
│   ├── analyzePhonemics()
│   ├── compareWithReference()
│   └── flagPronunciationErrors()
│
├── tajweedAnalysis()
│   ├── detectTajweedRules()
│   ├── analyzeElongation()
│   ├── analyzeNasalization()
│   ├── analyzeAssimilation()
│   └── analyzeOtherRules()
│
├── confidenceScoring()
│   ├── calculateWordConfidence()
│   ├── determineSeverity()
│   └── flagInconclusiveCases()
│
└── reportGeneration()
    ├── compileFinding()
    ├── generateSummary()
    └── createRecommendations()
```

### Backend Service Interface

```typescript
interface RecitationAnalysisAPI {
  // Main analysis endpoint
  analyzeRecitation(params: {
    projectId: string;
    audioFileId: string;
    audioUrl: string;
    surahNumber: number;
    verseStart: number;
    verseEnd: number;
    confidenceThreshold?: number; // default 0.6
    includeReference?: boolean;
  }): Promise<RecitationReview>;

  // Get reference audio for specific word
  getReferenceAudio(params: {
    surahNumber: number;
    verseNumber: number;
    wordNumber: number;
    readerId?: string; // default to Quran.com API
  }): Promise<{ audioUrl: string; reader: string }>;

  // Get Tajweed rules database
  getTajweedRules(): Promise<TajweedRule[]>;

  // Get Quranic text
  getQuranicText(params: {
    surahNumber: number;
    verseStart: number;
    verseEnd: number;
  }): Promise<QuranicVerse[]>;

  // Validate analysis (for testing)
  validateAnalysis(analysisId: string): Promise<ValidationResult>;
}
```

---

## 🎨 Screen Design: "Review My Recitation"

### Layout Structure

```
┌─────────────────────────────────────┐
│ ← Back  |  مراجعة تلاوتي  |  ⚙️      │
├─────────────────────────────────────┤
│                                     │
│  ▶️ [===●═══════] 1:45 / 3:20     │
│  Original: Surah Al-Fatihah         │
│           Verses 1-5                │
│                                     │
├─────────────────────────────────────┤
│ 📊 Analysis Results                 │
│ Accuracy: 92% | Words: 56 | Issues: 5│
├─────────────────────────────────────┤
│                                     │
│ 🔍 Findings (Sorted by Time)        │
│ ✓ Error  ⚠️ Probable  ❓ Inconclusive│
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 1. Word: "الحمد"                │ │
│ │    Issue: Pronunciation Error   │ │
│ │    Time: 0:15 - 0:17            │ │
│ │    Expected: alḥamdu            │ │
│ │    Detected: alḥamdu (slight)   │ │
│ │    Confidence: 85%              │ │
│ │    ▶️ Replay  🔊 Reference      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 2. Missing Word: "لله"          │ │
│ │    Location: After Word 2       │ │
│ │    Time Gap: 0:20               │ │
│ │    Severity: Confirmed Error    │ │
│ │    ▶️ Replay  🔊 Reference      │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ 📄 Final Report                     │
│                                     │
│ Summary:                            │
│ Your recitation is good with minor  │
│ pronunciation issues. Focus on the  │
│ letter "د" elongation.              │
│                                     │
│ Recommendations:                    │
│ • Practice the Alef elongation      │
│ • Review Tajweed rules for Ghunna   │
│ • Listen to reference daily         │
│                                     │
│ 📥 Save Report  📤 Share           │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Workflow

### User Journey

1. **User uploads audio** → Stored in Supabase Storage
2. **User selects Surah & Verses** → Data entry
3. **User clicks "Analyze"** → Analysis starts
4. **Backend processes** → Real-time progress
5. **Results displayed** → Review findings
6. **User reviews findings** → Can replay audio
7. **User views report** → Can save/share
8. **Report saved to project** → For later reference

### Analysis Process

```
Input Audio
    ↓
[Supabase Storage]
    ↓
Retrieve from Storage
    ↓
↙─────────────────────────────────↖
│                                 │
↙ Audio Processing ↙ Word Boundary Detection
  │ Normalize     │ ├─ Extract phonemes
  │ De-noise      │ ├─ Align with text
  │ Feature Extract
│ └─ Time stamps
  │                │
  └────┬───────────┘
       ↓
Quranic Text Matching
  ├─ Expected text retrieval
  ├─ Detected text comparison
  ├─ Missing words detection
  ├─ Extra words detection
  └─ Substitution detection
       ↓
Pronunciation Analysis
  ├─ Phonetic comparison
  ├─ Feature matching
  └─ Deviation scoring
       ↓
Tajweed Rules Application
  ├─ Rule detection
  ├─ Confidence scoring
  ├─ Severity classification
  └─ Inconclusive flagging
       ↓
Reference Comparison (Optional)
  ├─ Fetch reference audio
  ├─ Compare segments
  └─ Confidence adjustment
       ↓
Report Generation
  ├─ Compile findings
  ├─ Calculate metrics
  ├─ Generate recommendations
  └─ Format output
       ↓
Result Display
  └─ Save to Database
```

---

## 🛡️ Safety & Accuracy Principles

### ✅ What We DO

1. **Text-based matching** - Compare detected words against official Quranic text
2. **Phonetic analysis** - Analyze pronunciation patterns
3. **Tajweed detection** - Identify common Tajweed issues
4. **Confidence scoring** - Only flag issues with sufficient confidence
5. **Human flagging** - Mark items needing human review
6. **Reference comparison** - Compare against trusted recordings

### ❌ What We DON'T DO

1. **Modify Quranic text** - Never change or suggest changes to verses
2. **Guess at text** - Only use official, trusted sources
3. **Definitive Tajweed judgments** - Flag uncertain cases for human review
4. **Unfounded corrections** - Only report confident, evidence-based findings
5. **Suppress errors** - Err on the side of transparency

### Confidence Levels

| Level | Threshold | Treatment |
|-------|-----------|-----------|
| **Confirmed Error** | > 90% | Report definitively |
| **Probable Issue** | 70-90% | Report with caveat |
| **Inconclusive** | 50-70% | Flag for review |
| **Not Detected** | < 50% | Don't report |

---

## 📱 UI Components Required

### 1. RecitationReviewScreen
Main screen component with all sections

### 2. AudioPlayerWithTimeline
- Play/pause/seek
- Current time display
- Duration display
- Markers for findings

### 3. ReferenceAudioPlayer
- Compare audio side-by-side
- Synchronized playback
- Difficulty control

### 4. FindingCard
- Word display
- Error type badge
- Severity indicator
- Confidence score
- Play buttons
- Tajweed info

### 5. FilterBar
- Filter by type
- Filter by severity
- Filter by time range
- Sort options

### 6. ReportSummary
- Metrics display
- Charts/graphs
- Recommendations
- Save/share buttons

---

## 🗄️ Database Schema

```sql
-- Recitation reviews table
CREATE TABLE recitation_reviews (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id),
  audio_file_id UUID NOT NULL REFERENCES audio_files(id),
  surah_number INTEGER NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER NOT NULL,
  
  status TEXT CHECK (status IN ('analyzing', 'completed', 'failed')),
  
  total_words INTEGER,
  total_errors INTEGER,
  overall_confidence NUMERIC(3,2),
  
  reference_audio_url TEXT,
  reference_reader TEXT,
  
  final_report JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual findings table
CREATE TABLE recitation_findings (
  id UUID PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES recitation_reviews(id) ON DELETE CASCADE,
  
  word_number INTEGER,
  verse_number INTEGER,
  word_text TEXT,
  word_arabic TEXT,
  
  start_time NUMERIC(10,2),
  end_time NUMERIC(10,2),
  
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('error', 'probable', 'inconclusive')),
  confidence NUMERIC(3,2),
  
  expected TEXT,
  detected TEXT,
  description JSONB, -- {ar: "", en: ""}
  
  tajweed_rule JSONB, -- {name_ar, name_en, description, is_definitive}
  
  suggestions TEXT[],
  reference_audio_segment TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE recitation_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE recitation_findings ENABLE ROW LEVEL SECURITY;

-- Users can only see reviews for their projects
CREATE POLICY "Users see reviews in their projects" 
  ON recitation_reviews
  FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
```

---

## 🔌 API Endpoints

### Backend Service (Express/FastAPI)

```
POST /api/analyze-recitation
  Input: { audioUrl, surahNumber, verseStart, verseEnd, projectId }
  Output: { status: 'processing', taskId }

GET /api/analysis-status/:taskId
  Output: { status, progress, findings[] }

GET /api/reference-audio
  Query: { surahNumber, verseNumber, wordNumber, readerId? }
  Output: { audioUrl, reader }

GET /api/tajweed-rules
  Output: TajweedRule[]

POST /api/validate-analysis
  Input: { analysisId, corrections[] }
  Output: ValidationResult
```

---

## 🧪 Testing Strategy

### Test Cases

1. **Perfect Recitation**
   - Input: Correct recitation of Surah Al-Fatihah
   - Expected: No errors found, 100% accuracy

2. **Missing Word**
   - Input: Recording skips one word
   - Expected: "Missing word" finding at correct location

3. **Extra Word**
   - Input: Recording repeats one word
   - Expected: "Extra word" finding detected

4. **Pronunciation Error**
   - Input: Incorrect letter pronunciation
   - Expected: "Pronunciation error" finding with confidence > 80%

5. **Tajweed Issue**
   - Input: No Ghunna where required
   - Expected: "Tajweed" finding flagged for review

6. **Multiple Issues**
   - Input: Mixed errors
   - Expected: All issues detected with correct severities

### Success Metrics

- Precision > 85% (minimize false positives)
- Recall > 80% (catch actual errors)
- Confidence scoring accurate
- Processing time < 2min for 10-minute audio

---

## 📋 Implementation Phases

### Phase 1: Backend (Backend Agent)
- [ ] Audio processing pipeline
- [ ] Word boundary detection
- [ ] Text matching engine
- [ ] Confidence scoring
- [ ] Database schema

### Phase 2: Services (Service Agent)
- [ ] RecitationAnalysisService
- [ ] API integration
- [ ] Error handling
- [ ] Caching strategy

### Phase 3: UI (Frontend Agent)
- [ ] RecitationReviewScreen
- [ ] Components
- [ ] Real-time display
- [ ] User interactions

---

## 🚀 Launch Checklist

Before going live:

- [ ] Minimum 1000 test cases passed
- [ ] No Quranic text modifications
- [ ] All errors properly classified
- [ ] Confidence scoring validated
- [ ] Reference audio integration working
- [ ] Report generation accurate
- [ ] UI responsive on iPhone
- [ ] RTL/LTR fully functional
- [ ] Error messages helpful
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Documentation complete

---

## 📊 Success Criteria

✅ Users can upload Quranic recitations  
✅ System analyzes accurately  
✅ Findings are displayed clearly  
✅ No Quranic text is modified  
✅ Users can review and improve  
✅ Reports are saved with projects  
✅ Feature is integrated into app flow  

---

**Version**: 1.0  
**Status**: Ready for 3-Agent Development  
**Next Step**: Launch implementation agents
