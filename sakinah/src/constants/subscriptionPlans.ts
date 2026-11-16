import { Subscription } from '@types/index';

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    videosPerMonth: 5,
    maxQuality: '720p' as const,
    storage: 1000, // MB
    customBackgrounds: false,
    support: 'community',
  },
  pro: {
    name: 'Pro',
    price: 4.99,
    videosPerMonth: 50,
    maxQuality: '1080p' as const,
    storage: 50000, // MB (50GB)
    customBackgrounds: true,
    support: 'standard',
  },
  premium: {
    name: 'Premium',
    price: 9.99,
    videosPerMonth: 999, // unlimited
    maxQuality: '4k' as const,
    storage: 500000, // MB (500GB)
    customBackgrounds: true,
    support: 'priority',
  },
};

export const PLAN_FEATURES = {
  free: [
    'Create up to 5 videos per month',
    'Up to 720p quality',
    '1GB storage',
    'Community support',
    'Standard backgrounds and templates',
  ],
  pro: [
    'Create up to 50 videos per month',
    'Up to 1080p quality',
    '50GB storage',
    'Standard support',
    'All backgrounds and templates',
    'Custom background uploads',
  ],
  premium: [
    'Unlimited video creation',
    'Up to 4K quality',
    '500GB storage',
    'Priority support',
    'All backgrounds and templates',
    'Custom background uploads',
    'Early access to new features',
  ],
};

export const VIDEO_FORMATS = [
  { value: '9:16', label: 'Vertical (Shorts)', shortLabel: '9:16' },
  { value: '16:9', label: 'Horizontal (YouTube)', shortLabel: '16:9' },
  { value: '1:1', label: 'Square (Instagram)', shortLabel: '1:1' },
];

export const VIDEO_QUALITIES = [
  { value: '720p', label: '720p HD' },
  { value: '1080p', label: '1080p Full HD' },
  { value: '4k', label: '4K Ultra HD' },
];

export const ANIMATION_TYPES = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide_up', label: 'Slide Up' },
  { value: 'slide_down', label: 'Slide Down' },
  { value: 'slide_left', label: 'Slide Left' },
  { value: 'slide_right', label: 'Slide Right' },
  { value: 'zoom_in', label: 'Zoom In' },
  { value: 'zoom_out', label: 'Zoom Out' },
  { value: 'scale_bounce', label: 'Bounce' },
];

export const BACKGROUND_ANIMATIONS = [
  { value: 'static', label: 'Static' },
  { value: 'slow_zoom', label: 'Slow Zoom' },
  { value: 'pan', label: 'Pan' },
  { value: 'fade_overlay', label: 'Fade Overlay' },
  { value: 'particle_effect', label: 'Particles' },
];

export const TEXT_ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

export const TEXT_POSITIONS = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];

export const DISPLAY_MODES = [
  { value: 'word_by_word', label: 'Word by Word' },
  { value: 'verse_by_verse', label: 'Verse by Verse' },
];

export const BACKGROUND_CATEGORIES = [
  { value: 'kaaba', label: 'Kaaba', labelAr: 'الكعبة المشرفة' },
  { value: 'mosque', label: 'Mosque', labelAr: 'المسجد' },
  { value: 'nature', label: 'Nature', labelAr: 'الطبيعة' },
  { value: 'sky', label: 'Sky', labelAr: 'السماء' },
  { value: 'urban', label: 'Urban', labelAr: 'مدينة' },
  { value: 'custom', label: 'Custom', labelAr: 'مخصص' },
];

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'm4a', 'wav', 'aac'];
export const MAX_AUDIO_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_VIDEO_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export const DEFAULT_TEMPLATE_CONFIG = {
  fontFamily: 'Cairo',
  fontSize: 48,
  textColor: '#ffffff',
  textPosition: { x: 50, y: 70, align: 'center' },
  animationType: 'fade' as const,
  displayMode: 'verse_by_verse' as const,
  backgroundAnimation: 'slow_zoom' as const,
};

// Surahs information (all 114 Quranic Surahs)
export const SURAHS = [
  { number: 1, nameAr: 'الفاتحة', nameEn: 'Al-Fatihah', verses: 7 },
  { number: 2, nameAr: 'البقرة', nameEn: 'Al-Baqarah', verses: 286 },
  { number: 3, nameAr: 'آل عمران', nameEn: 'Ali Imran', verses: 200 },
  { number: 4, nameAr: 'النساء', nameEn: 'An-Nisa', verses: 176 },
  { number: 5, nameAr: 'المائدة', nameEn: 'Al-Maidah', verses: 120 },
  { number: 6, nameAr: 'الأنعام', nameEn: 'Al-Anam', verses: 165 },
  { number: 7, nameAr: 'الأعراف', nameEn: 'Al-Araf', verses: 206 },
  { number: 8, nameAr: 'الأنفال', nameEn: 'Al-Anfal', verses: 75 },
  { number: 9, nameAr: 'التوبة', nameEn: 'At-Tawbah', verses: 129 },
  { number: 10, nameAr: 'يونس', nameEn: 'Yunus', verses: 109 },
  // ... Add all remaining surahs following the same pattern
  // This is a partial list for demonstration
];
