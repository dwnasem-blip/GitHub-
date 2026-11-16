# Quranic Recitation Review UI Specification
# مواصفات واجهة مراجعة التلاوة القرآنية

**Version**: 1.0  
**Phase**: 4 - AI Recitation Analysis UI  
**Date**: November 16, 2026  
**Status**: 🚀 Ready for Implementation

---

## Overview

The Recitation Review Screen displays AI analysis results of a user's Quranic recitation. It presents findings, audio playback controls, filtering options, and a final report with metrics and recommendations.

### Key Features
- ✅ Audio playback with timeline and markers
- ✅ Real-time analysis results display
- ✅ Findings list with filtering and sorting
- ✅ Error severity indicators
- ✅ Confidence scoring
- ✅ Reference audio comparison
- ✅ Final report with recommendations
- ✅ RTL/LTR support
- ✅ Dark cinematic theme
- ✅ Responsive mobile design

---

## Architecture Overview

```
RecitationReviewScreen (Main Container)
├── Header (Back button + Title)
├── AudioPlayerWithTimeline
│   ├── PlayButton
│   ├── TimelineSlider
│   ├── TimeDisplay
│   └── MarkersList
├── AnalysisResultsHeader
│   ├── OverallAccuracy
│   ├── TotalWords
│   └── TotalIssues
├── FilterBar
│   ├── TypeFilter (All/Error/Probable/Inconclusive)
│   ├── SeverityFilter
│   ├── SortOptions
│   └── SearchInput
├── FindingsList (FlatList)
│   └── FindingCard (Repeating)
│       ├── WordDisplay
│       ├── ErrorBadge
│       ├── SeverityIndicator
│       ├── ConfidenceScore
│       ├── ExpectedVsDetected
│       ├── Description
│       ├── TajweedInfo
│       └── PlayButtons
├── ReportSummary
│   ├── SummaryMetrics
│   ├── ErrorBreakdown
│   ├── Recommendations
│   └── ActionButtons
└── Footer (Save/Share/Export)
```

---

## Component Specifications

### 1. RecitationReviewScreen (Main Container)

**Location**: `src/screens/recitation/RecitationReviewScreen.tsx`

**Props**:
```typescript
interface RecitationReviewScreenProps {
  projectId: string;
  audioFileId: string;
  recitationMatchId: string;
}
```

**Responsibilities**:
- Fetch recitation analysis data
- Manage findings state (filtered/sorted)
- Handle audio playback state
- Coordinate section visibility
- Manage scroll position

**Key Methods**:
```typescript
- fetchRecitationData(): Promise<void>
- filterFindings(filters: FilterOptions): Finding[]
- sortFindings(sortBy: SortOption): Finding[]
- handleWordClick(word: Word, timestamp: number): void
- handleShare(): Promise<void>
- handleExport(): Promise<void>
```

**States**:
```typescript
- loading: boolean
- error: string | null
- recitationData: RecitationMatch | null
- findings: Finding[]
- filteredFindings: Finding[]
- selectedFinding: Finding | null
- currentTime: number
- isPlaying: boolean
```

---

### 2. AudioPlayerWithTimeline

**Location**: `src/components/recitation/AudioPlayerWithTimeline.tsx`

**Props**:
```typescript
interface AudioPlayerWithTimelineProps {
  audioUrl: string;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  verses: Verse[]
  findings: Finding[]
  onPlayPause: (isPlaying: boolean) => void
  onSeek: (time: number) => void
  onMarkerPress: (finding: Finding) => void
}
```

**Features**:
- Play/pause button with icon animation
- Seek bar with current/total time
- Verse markers on timeline
- Finding markers with error indicators
- Bookmarks display
- Current time display (HH:MM:SS)

**Timeline Markers**:
- 🟢 Green: Correct verse
- 🔴 Red: Error found
- 🟡 Yellow: Probable issue
- ⚪ Gray: Inconclusive

---

### 3. ReferenceAudioPlayer

**Location**: `src/components/recitation/ReferenceAudioPlayer.tsx`

**Props**:
```typescript
interface ReferenceAudioPlayerProps {
  referenceAudioUrl: string
  userAudioUrl: string
  currentTime: number
  onTimeChange: (time: number) => void
  verse: Verse
}
```

**Features**:
- Side-by-side comparison mode
- Play reference audio for comparison
- Sync playback between user and reference
- Display verse text with timing

---

### 4. FindingCard

**Location**: `src/components/recitation/FindingCard.tsx`

**Props**:
```typescript
interface FindingCardProps {
  finding: Finding
  isSelected: boolean
  index: number
  onPress: () => void
  onPlayOriginal: () => void
  onPlayReference: () => void
}
```

**Layout Structure**:

```
┌─────────────────────────────────────┐
│ [Error Badge] Word Display [Severity]│
├─────────────────────────────────────┤
│ Expected: [correct word]            │
│ Detected: [wrong word]              │
├─────────────────────────────────────┤
│ Type: Makhraj Error                 │
│ Confidence: 94%                     │
├─────────────────────────────────────┤
│ Description (AR):                   │
│ تم اكتشاف عدم دقة في مخرج الحرف   │
│                                     │
│ Description (EN):                   │
│ Makhraj (articulation point) error  │
├─────────────────────────────────────┤
│ Tajweed Info:                       │
│ Rule: Ghunna (Nasal Sound)         │
│ Application: Heavy letter with ن    │
├─────────────────────────────────────┤
│ ▶ Play User  ▶ Play Reference      │
└─────────────────────────────────────┘
```

**Sections**:
1. **Header Row**:
   - Error type badge (Makhraj/Tajweed/Timing)
   - Word display (Arabic + transliteration)
   - Severity indicator (Error/Probable/Inconclusive)

2. **Expected vs Detected**:
   - Show correct pronunciation
   - Show what was detected
   - Confidence percentage

3. **Description**:
   - Arabic explanation
   - English explanation
   - Technical details

4. **Tajweed Information** (if applicable):
   - Tajweed rule name
   - Rule application explanation
   - Examples from other Surahs

5. **Action Buttons**:
   - Play original pronunciation
   - Play reference audio
   - Learn more (optional)

**Styling**:
- Dark background with accent border
- Error level determines border color:
  - 🔴 Error: Gold/Yellow
  - 🟡 Probable: Orange
  - ⚪ Inconclusive: Gray
- Smooth expand animation
- Rounded corners (12px)

---

### 5. FilterBar

**Location**: `src/components/recitation/FilterBar.tsx`

**Props**:
```typescript
interface FilterBarProps {
  activeType: FindingType
  activeSeverity: Severity | null
  sortBy: SortOption
  onTypeChange: (type: FindingType) => void
  onSeverityChange: (severity: Severity | null) => void
  onSortChange: (option: SortOption) => void
  onSearch: (query: string) => void
}
```

**Filters**:
1. **Type Filter** (Chips):
   - All (default)
   - Makhraj (articulation)
   - Tajweed (recitation rules)
   - Timing (incorrect pacing)
   - Pronunciation

2. **Severity Filter** (Dropdown):
   - All (default)
   - Error (critical)
   - Probable (likely issue)
   - Inconclusive (needs review)

3. **Sort Options** (Dropdown):
   - By timestamp
   - By severity
   - By confidence
   - By type

4. **Search** (TextInput):
   - Search word in Arabic
   - Search transliteration
   - Case-insensitive

---

### 6. ReportSummary

**Location**: `src/components/recitation/ReportSummary.tsx`

**Props**:
```typescript
interface ReportSummaryProps {
  recitationData: RecitationMatch
  findings: Finding[]
  expanded: boolean
}
```

**Sections**:

1. **Summary Metrics** (Cards):
   ```
   ┌──────────────────────────────────┐
   │ Overall Accuracy    │    94.2%    │
   │ Total Words         │    1,247    │
   │ Correct Words       │    1,174    │
   │ Words with Issues   │      73     │
   │ Surah              │  Surah Al-Fatihah (1)  │
   │ Duration           │    2:45     │
   └──────────────────────────────────┘
   ```

2. **Error Breakdown** (Chart):
   - Pie chart showing error distribution:
     - Makhraj (40%)
     - Tajweed (35%)
     - Timing (20%)
     - Other (5%)

3. **Findings by Severity**:
   - 🔴 Errors: 15
   - 🟡 Probable: 42
   - ⚪ Inconclusive: 16

4. **Top Recommendations** (List):
   ```
   1. Practice Qalqalah rule (3 findings)
   2. Improve Ghunna application (5 findings)
   3. Work on Hamza handling (2 findings)
   4. Practice proper Diacritics (8 findings)
   ```

5. **Action Buttons**:
   - 💾 Save Report
   - 📊 Export PDF
   - 📤 Share Results
   - 🎯 Create Practice Session

---

## Data Models

### Finding
```typescript
interface Finding {
  id: string
  recitationMatchId: string
  wordId: string
  arabicWord: string
  transliteration: string
  startTime: number
  endTime: number
  confidence: number
  errorType: ErrorType
  severity: Severity
  expectedPronunciation: string
  detectedPronunciation: string
  descriptionAr: string
  descriptionEn: string
  tajweedRule?: TajweedRule
  referenceAudioTimestamp?: number
  createdAt: string
}

type ErrorType = 'Makhraj' | 'Tajweed' | 'Timing' | 'Pronunciation'
type Severity = 'Error' | 'Probable' | 'Inconclusive'

interface TajweedRule {
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  examples: string[]
}
```

### RecitationMatch
```typescript
interface RecitationMatch {
  id: string
  audioFileId: string
  userId: string
  surahNumber: number
  surahNameAr: string
  surahNameEn: string
  startVerse: number
  endVerse: number
  confidence: number
  overallAccuracy: number
  totalWords: number
  correctWords: number
  findings: Finding[]
  verses: Verse[]
  duration: number
  referenceAudioUrl?: string
  createdAt: string
  updatedAt: string
}

interface Verse {
  number: number
  arabicText: string
  englishTranslation: string
  startTime: number
  endTime: number
  words: Word[]
}

interface Word {
  id: string
  arabicText: string
  transliteration: string
  startTime: number
  endTime: number
  confidence: number
  hasIssue: boolean
  issueType?: ErrorType
}
```

---

## Design System Integration

### Colors
```typescript
// From theme/colors.ts
Primary: #2FCC71      // Islamic Green
Secondary: #E8D15F    // Gold
Error: #E74C3C        // Red
Warning: #F39C12      // Orange
Success: #27AE60      // Green
Surface: #0F0F0F      // Near Black
```

### Typography
```typescript
// Header
Font: 24px, Bold, Regular
Color: White

// Section Title
Font: 18px, SemiBold
Color: Primary Green

// Body Text
Font: 14px, Regular
Color: Light Gray

// Error Badge
Font: 12px, Bold
Color: White on Error Background
```

### Spacing
```typescript
Padding: 16px (containers)
Margin: 12px (sections)
Radius: 12px (cards)
Shadow: 0 4px 12px rgba(0,0,0,0.3)
```

### Animations
```typescript
// Smooth transitions
Fade in findings: 300ms
Expand card: 250ms
Timeline slider: Instant
Play button rotation: 200ms
```

---

## RTL/LTR Support

### Implementation
1. All text alignment uses `I18nManager.isRTL`
2. Direction-aware flexbox layouts
3. Margin/padding flipped for RTL
4. Text input direction auto-detected
5. Numbers always LTR (timestamps, accuracy %)

### Components to Update
```typescript
- Text: textAlign: 'auto'
- View: flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row'
- Margins: marginStart/marginEnd
- Paddings: paddingStart/paddingEnd
```

---

## API Integration

### Services Required

1. **recitationService.ts**
```typescript
class RecitationService {
  async getRecitationMatch(id: string): Promise<RecitationMatch>
  async getFindings(matchId: string): Promise<Finding[]>
  async exportReport(matchId: string, format: 'pdf' | 'json'): Promise<string>
  async shareResults(matchId: string, email: string): Promise<void>
  async createPracticeSession(findings: Finding[]): Promise<string>
}
```

2. **audioService.ts** (already exists)
```typescript
- Extend with reference audio playback
- Support timestamp-based playback
- Handle audio synchronization
```

---

## Screen Flow

```
1. User opens project
   ↓
2. RecitationReviewScreen loads
   ├─ Fetch recitationMatch data
   ├─ Load audio files (user + reference)
   ├─ Parse findings
   └─ Render components

3. User interactions:
   ├─ Play audio → AudioPlayer handles
   ├─ Filter findings → FilterBar updates
   ├─ Select finding → FindingCard expands
   ├─ Play original/reference → Audio comparison
   └─ View report → ReportSummary expands

4. User actions:
   ├─ Save report → Toast notification
   ├─ Export PDF → Download manager
   ├─ Share → Share sheet
   └─ Create practice → Navigate to practice screen
```

---

## Accessibility Requirements

- ✅ WCAG 2.1 AA compliance
- ✅ Proper `accessibilityLabel` on all components
- ✅ `accessibilityRole` for semantic meaning
- ✅ Color contrast > 4.5:1
- ✅ Touch targets > 44x44pt
- ✅ Screen reader support
- ✅ RTL text direction support

---

## Performance Targets

- Initial load: < 2s
- Finding list scroll: 60fps
- Audio playback: Smooth, no stuttering
- Filter/sort: < 300ms
- Component render: < 100ms

**Optimization Strategies**:
1. Virtualize long lists (FlatList)
2. Memoize components (React.memo)
3. Lazy load images
4. Cache audio data
5. Debounce search input

---

## Error Handling

### Network Errors
- Display retry button
- Show offline indicator
- Queue actions offline

### Audio Errors
- Cannot load audio → Show error message
- Playback failure → Pause and show error
- Reference audio missing → Disable comparison

### Data Errors
- Missing findings → Show "No issues found"
- Corrupted data → Show error boundary
- Invalid timestamps → Skip problematic sections

---

## Testing Strategy

### Unit Tests
- Component rendering
- Prop validation
- Filter logic
- Sort logic
- RTL calculations

### Integration Tests
- Audio playback
- Finding display
- Filter/sort integration
- API calls

### E2E Tests
- Full user flow
- Play audio → Select finding → View details
- Export functionality
- Share functionality

---

## Deployment Checklist

- ✅ Type checking passes
- ✅ ESLint passes
- ✅ All components render
- ✅ RTL/LTR works
- ✅ Dark theme applied
- ✅ Audio playback works
- ✅ Scroll performance 60fps
- ✅ No console errors
- ✅ Responsive on iPhone 12/14/15
- ✅ Accessibility verified

---

## File Structure

```
src/
├── screens/
│   └── recitation/
│       └── RecitationReviewScreen.tsx
├── components/
│   └── recitation/
│       ├── AudioPlayerWithTimeline.tsx
│       ├── ReferenceAudioPlayer.tsx
│       ├── FindingCard.tsx
│       ├── FilterBar.tsx
│       ├── ReportSummary.tsx
│       └── index.ts
├── services/
│   └── recitationService.ts
├── app/
│   └── recitation/
│       └── review.tsx (Expo Router)
└── types/
    └── index.ts (add Finding, RecitationMatch types)
```

---

**Version**: 1.0  
**Status**: Ready for Implementation  
**Last Updated**: November 16, 2026
