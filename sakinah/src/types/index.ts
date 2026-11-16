// User Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  language: 'ar' | 'en';
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  language: 'ar' | 'en';
  updated_at: string;
}

// Project Types
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
}

// Audio File Types
export interface AudioFile {
  id: string;
  project_id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  duration: number;
  size: number;
  mime_type: string;
  created_at: string;
}

// Recitation Analysis Types
export interface RecitationMatch {
  id: string;
  audio_file_id: string;
  surah_number: number;
  surah_name_ar: string;
  surah_name_en: string;
  verses: VerseMatch[];
  confidence: number;
  overall_accuracy: number;
  total_words: number;
  correct_words: number;
  created_at: string;
  user_id: string;
}

export interface VerseMatch {
  id: string;
  recitation_match_id: string;
  verse_number: number;
  arabic_text: string;
  english_translation?: string;
  start_time: number;
  end_time: number;
  confidence: number;
  word_timings?: WordTiming[];
}

export interface WordTiming {
  word: string;
  start_time: number;
  end_time: number;
  confidence: number;
}

// Finding/Analysis Types
export type ErrorType = 'Makhraj' | 'Tajweed' | 'Timing' | 'Pronunciation' | 'Other';
export type Severity = 'Error' | 'Probable' | 'Inconclusive';
export type FindingType = 'All' | 'Makhraj' | 'Tajweed' | 'Timing' | 'Pronunciation';
export type SortOption = 'timestamp' | 'severity' | 'confidence' | 'type';

export interface TajweedRule {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  examples: string[];
}

export interface Finding {
  id: string;
  recitation_match_id: string;
  word_id: string;
  arabic_word: string;
  transliteration: string;
  start_time: number;
  end_time: number;
  confidence: number;
  error_type: ErrorType;
  severity: Severity;
  expected_pronunciation: string;
  detected_pronunciation: string;
  description_ar: string;
  description_en: string;
  tajweed_rule?: TajweedRule;
  reference_audio_timestamp?: number;
  created_at: string;
}

export interface FilterOptions {
  type: FindingType;
  severity: Severity | null;
  sortBy: SortOption;
  searchQuery: string;
}

export interface RecitationReviewData {
  recitationMatch: RecitationMatch;
  findings: Finding[];
  verses: VerseMatch[];
}

// Background Types
export interface Background {
  id: string;
  title: string;
  category: 'kaaba' | 'mosque' | 'nature' | 'sky' | 'urban' | 'custom';
  media_url: string;
  media_type: 'image' | 'video';
  thumbnail_url: string;
  is_premium: boolean;
  created_at: string;
}

// Template Types
export interface Template {
  id: string;
  title: string;
  description?: string;
  font_family: string;
  font_size: number;
  text_color: string;
  text_position: TextPosition;
  animation_type: AnimationType;
  display_mode: 'word_by_word' | 'verse_by_verse';
  background_animation: BackgroundAnimation;
  is_premium: boolean;
  created_at: string;
}

export interface TextPosition {
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
}

export type AnimationType =
  | 'fade'
  | 'slide_up'
  | 'slide_down'
  | 'slide_left'
  | 'slide_right'
  | 'zoom_in'
  | 'zoom_out'
  | 'scale_bounce';

export type BackgroundAnimation =
  | 'static'
  | 'slow_zoom'
  | 'pan'
  | 'fade_overlay'
  | 'particle_effect';

// Render Job Types
export interface RenderJob {
  id: string;
  project_id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: VideoFormat;
  quality: VideoQuality;
  output_url?: string;
  error_message?: string;
  progress: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export type VideoFormat = '9:16' | '16:9' | '1:1';
export type VideoQuality = '720p' | '1080p' | '4k';

// Subscription Types
export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  subscription_id: string;
  videos_created: number;
  videos_limit: number;
  storage_used: number;
  storage_limit: number;
  processing_hours_used: number;
  processing_hours_limit: number;
  reset_date: string;
  created_at: string;
}

// Video Generation Config
export interface VideoGenerationConfig {
  project_id: string;
  audio_file_id: string;
  recitation_match_id: string;
  format: VideoFormat;
  quality: VideoQuality;
  background_id: string;
  template_id: string;
  custom_title?: string;
  custom_reader_name?: string;
  display_mode: 'word_by_word' | 'verse_by_verse';
  animation_type: AnimationType;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

// Recitation Analysis Types (Backend)
export interface RecitationReview {
  id: string;
  project_id: string;
  audio_file_id: string;
  surah_number: number;
  surah_name_ar: string;
  surah_name_en?: string;
  verses_range: {
    start: number;
    end: number;
  };

  findings: RecitationFinding[];
  overall_confidence: number;
  total_words_analyzed: number;
  total_errors_found: number;

  reference_audio_url?: string;
  reference_reader?: string;

  final_report: ReviewReport;

  status: 'analyzing' | 'completed' | 'failed';
  analysis_timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface RecitationFinding {
  id: string;
  word_number: number;
  verse_number: number;
  word_text: string;
  word_arabic: string;

  start_time: number;
  end_time: number;
  duration: number;

  type: 'missing_word' | 'extra_word' | 'wrong_word' |
        'pronunciation' | 'tajweed' | 'elongation' | 'nasalization' |
        'assimilation' | 'concealment' | 'manifestation' | 'vibration';

  severity: 'error' | 'probable' | 'inconclusive';
  confidence: number;

  expected: string;
  detected: string;
  description_ar: string;
  description_en: string;

  tajweed_rule?: {
    name_ar: string;
    name_en: string;
    rule_description: string;
    is_definitive: boolean;
  };

  suggestions: string[];
  reference_audio_segment?: string;
}

export interface ReviewReport {
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

  by_type: Record<string, number>;
  by_tajweed_rule: Record<string, number>;

  recommendations_ar: string[];
  recommendations_en: string[];

  performance_metrics: {
    clarity: number;
    accuracy: number;
    tajweed_application: number;
  };

  generated_at: string;
}

export interface QuranicVerse {
  surah_number: number;
  verse_number: number;
  arabic_text: string;
  transliteration: string;
  english_translation?: string;
  word_count: number;
  words: QuranicWord[];
}

export interface QuranicWord {
  word_number: number;
  arabic: string;
  transliteration: string;
  english?: string;
}

export interface AnalysisParams {
  projectId: string;
  audioFileId: string;
  audioUrl: string;
  surahNumber: number;
  verseStart: number;
  verseEnd: number;
  confidenceThreshold?: number;
  includeReference?: boolean;
}

export interface ConfidenceResult {
  confidence: number;
  severity: 'error' | 'probable' | 'inconclusive';
  reasons: string[];
}

export interface AudioFeatures {
  mfcc: number[][];
  energy: number[];
  zero_crossing_rate: number[];
  spectral_centroid: number[];
  sample_rate: number;
  duration: number;
}

// Recitation Review UI Types
export type ErrorType = 'Makhraj' | 'Tajweed' | 'Timing' | 'Pronunciation' | 'Other';
export type Severity = 'Error' | 'Probable' | 'Inconclusive';
export type FindingType = 'All' | 'Makhraj' | 'Tajweed' | 'Timing' | 'Pronunciation';
export type SortOption = 'timestamp' | 'severity' | 'confidence' | 'type';

export interface TajweedRule {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  examples: string[];
}

export interface Finding {
  id: string;
  recitation_match_id: string;
  word_id: string;
  arabic_word: string;
  transliteration: string;
  start_time: number;
  end_time: number;
  confidence: number;
  error_type: ErrorType;
  severity: Severity;
  expected_pronunciation: string;
  detected_pronunciation: string;
  description_ar: string;
  description_en: string;
  tajweed_rule?: TajweedRule;
  reference_audio_timestamp?: number;
  created_at: string;
}

export interface FilterOptions {
  type: FindingType;
  severity: Severity | null;
  sortBy: SortOption;
  searchQuery: string;
}

export interface RecitationReviewData {
  recitationMatch: RecitationMatch;
  findings: Finding[];
  verses: VerseMatch[];
}
