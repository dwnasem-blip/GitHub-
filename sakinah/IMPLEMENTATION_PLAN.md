# SAKINAH AI - Implementation Plan

## Project Overview
SAKINAH is a comprehensive Quranic video production platform that transforms audio recitations into stunning cinematic videos using AI and advanced video processing.

---

## Phase 1: Foundation & Infrastructure (Current)

### ✅ Completed
- [x] Project initialization with Expo and TypeScript
- [x] Folder structure and project architecture
- [x] TypeScript configuration
- [x] Design system (colors, spacing, typography)
- [x] Environment configuration (.env setup)
- [x] Type definitions for all major entities
- [x] Internationalization setup (Arabic & English)
- [x] Zustand state management setup
- [x] Supabase client configuration

### 🔄 Next Steps (Phase 1 Completion)
- [ ] Supabase project creation and database setup
- [ ] SQL migrations implementation
- [ ] Row Level Security (RLS) policies
- [ ] Authentication services integration
- [ ] Error handling and logging utilities

---

## Phase 2: Authentication & User Management

### Features to Implement
- [ ] User registration (email/password)
- [ ] User login with Supabase Auth
- [ ] Social authentication (Apple, Google)
- [ ] Password reset flow
- [ ] User profile management
- [ ] Session management
- [ ] Role-based access control

### Dependencies
- [ ] Supabase Auth setup
- [ ] Auth service layer
- [ ] Protected routes with Expo Router
- [ ] Authentication hooks

---

## Phase 3: Core Data Management

### Features to Implement
- [ ] Project CRUD operations
- [ ] Audio file upload to Supabase Storage
- [ ] Project persistence and retrieval
- [ ] User data isolation (RLS)
- [ ] Background library management
- [ ] Template management

### Database Tables Required
- [ ] profiles
- [ ] projects
- [ ] audio_files
- [ ] backgrounds
- [ ] templates

---

## Phase 4: AI Recitation Analysis

### Features to Implement
- [ ] Audio upload and processing
- [ ] Surah identification
- [ ] Verse matching with Quranic text
- [ ] Confidence score calculation
- [ ] Verse timing extraction
- [ ] Word-level timing (if available)

### Integration Points
- [ ] AI service API integration
- [ ] Recitation matching algorithm
- [ ] Error handling and retry logic
- [ ] Progress tracking

### Database Tables Required
- [ ] recitation_matches
- [ ] verse_timings
- [ ] word_timings (optional)

---

## Phase 5: Video Editor UI

### Features to Implement
- [ ] Background selection interface
- [ ] Font selection and customization
- [ ] Text color and size controls
- [ ] Text position adjustment
- [ ] Animation selection
- [ ] Display mode selection (word/verse by verse)
- [ ] Live preview capability
- [ ] Metadata editor (reader name, surah name)

### Components to Create
- [ ] BackgroundSelector
- [ ] FontPicker
- [ ] ColorPicker
- [ ] AnimationSelector
- [ ] PreviewPlayer
- [ ] MetadataEditor

---

## Phase 6: Video Rendering & Export

### Features to Implement
- [ ] Video format selection (9:16, 16:9, 1:1)
- [ ] Quality selection (720p, 1080p, 4K)
- [ ] Render job creation and management
- [ ] Progress tracking
- [ ] Error handling and retry
- [ ] Video download capability
- [ ] Video sharing functionality

### Integration Points
- [ ] FFmpeg backend integration
- [ ] Job queue management
- [ ] Progress updates (WebSocket or polling)
- [ ] File storage management

### Database Tables Required
- [ ] render_jobs
- [ ] rendered_videos

---

## Phase 7: Subscription & Monetization

### Features to Implement
- [ ] RevenueCat integration
- [ ] Subscription plans (Free, Pro, Premium)
- [ ] Usage tracking and limits enforcement
- [ ] In-app purchase handling
- [ ] Subscription status management
- [ ] Feature access control based on plan

### Database Tables Required
- [ ] subscriptions
- [ ] usage_records

---

## Phase 8: Admin Dashboard (Web)

### Features to Implement
- [ ] User management interface
- [ ] Subscription monitoring
- [ ] Background library management
- [ ] Render job monitoring
- [ ] Error tracking and logging
- [ ] Usage analytics
- [ ] Configuration management

### Tech Stack
- [ ] React + TypeScript
- [ ] Supabase for data
- [ ] Admin authentication

---

## Phase 9: Testing & Quality Assurance

### Testing Coverage
- [ ] Authentication flows
- [ ] File uploads
- [ ] Recitation analysis
- [ ] Video rendering
- [ ] Subscription verification
- [ ] RTL text rendering (Arabic)
- [ ] Data isolation (RLS)

### Test Types
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests

---

## Phase 10: Deployment & Launch

### Preparation
- [ ] iOS build with EAS
- [ ] Android build with EAS
- [ ] App Store submission
- [ ] Google Play submission
- [ ] Admin dashboard deployment
- [ ] Monitoring setup
- [ ] Documentation

---

## Database Schema Overview

```
profiles
├── id (UUID, PK)
├── user_id (FK to auth.users)
├── full_name
├── avatar_url
├── language
├── created_at
└── updated_at

projects
├── id (UUID, PK)
├── user_id (FK to profiles)
├── title
├── description
├── status
├── created_at
└── updated_at

audio_files
├── id (UUID, PK)
├── project_id (FK to projects)
├── user_id (FK to profiles)
├── file_name
├── file_url
├── duration
├── size
├── mime_type
└── created_at

recitation_matches
├── id (UUID, PK)
├── audio_file_id (FK to audio_files)
├── surah_number
├── surah_name_ar
├── surah_name_en
├── confidence
└── created_at

verse_timings
├── id (UUID, PK)
├── recitation_match_id (FK to recitation_matches)
├── verse_number
├── arabic_text
├── english_translation
├── start_time
├── end_time
├── confidence
└── word_timings (JSONB)

backgrounds
├── id (UUID, PK)
├── title
├── category
├── media_url
├── media_type
├── thumbnail_url
├── is_premium
└── created_at

templates
├── id (UUID, PK)
├── title
├── description
├── font_family
├── font_size
├── text_color
├── text_position (JSONB)
├── animation_type
├── display_mode
├── background_animation
├── is_premium
└── created_at

render_jobs
├── id (UUID, PK)
├── project_id (FK to projects)
├── user_id (FK to profiles)
├── status
├── format
├── quality
├── output_url
├── error_message
├── progress
├── created_at
├── updated_at
├── started_at
└── completed_at

rendered_videos
├── id (UUID, PK)
├── render_job_id (FK to render_jobs)
├── video_url
├── thumbnail_url
├── duration
├── file_size
└── created_at

subscriptions
├── id (UUID, PK)
├── user_id (FK to profiles)
├── plan
├── status
├── current_period_start
├── current_period_end
├── created_at
└── updated_at

usage_records
├── id (UUID, PK)
├── user_id (FK to profiles)
├── subscription_id (FK to subscriptions)
├── videos_created
├── videos_limit
├── storage_used
├── storage_limit
├── processing_hours_used
├── processing_hours_limit
├── reset_date
└── created_at
```

---

## Key Configuration Files

### Environment Variables (.env)
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_API_URL
EXPO_PUBLIC_REVENUE_CAT_API_KEY
EXPO_PUBLIC_PROCESSING_API_URL
```

### App Configuration (app.json)
- Splash screen
- Icon configuration
- EAS build settings
- Plugin configurations

---

## Development Standards

### Code Style
- TypeScript strict mode enabled
- ESLint configuration
- Prettier for formatting
- Path aliases for clean imports

### File Naming
- Components: PascalCase (e.g., UserProfile.tsx)
- Services: camelCase (e.g., authService.ts)
- Utilities: camelCase (e.g., dateUtils.ts)
- Types: PascalCase in types/index.ts

### Folder Structure
```
src/
├── screens/        # Screen components (Expo Router)
├── components/     # Reusable UI components
├── services/       # API and business logic
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
├── constants/      # App constants
├── utils/          # Utility functions
├── config/         # Configuration files
├── theme/          # Design system
├── i18n/           # Internationalization
└── store/          # Zustand stores
```

---

## Security Considerations

1. **Never commit secrets** - Use .env files
2. **Row Level Security** - All user data protected with RLS policies
3. **HTTPS Only** - All API calls over HTTPS
4. **Secure Storage** - Use expo-secure-store for sensitive data
5. **Token Management** - Supabase Auth handles session tokens
6. **User Isolation** - Every user can only access their own data

---

## Performance Targets

- App startup time: < 3 seconds
- Screen transitions: < 300ms
- Audio upload: Resumable on network failures
- Video rendering: Progress tracked and pauseable
- Database queries: Optimized with indexes and RLS

---

## Next Immediate Actions

1. Set up Supabase project (free tier can start)
2. Create and migrate database schema
3. Implement RLS policies
4. Create authentication screens and flows
5. Build home screen and project list
6. Implement audio upload functionality

---

## Timeline Estimates

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1 | 2-3 days | In Progress |
| Phase 2 | 3-4 days | Planned |
| Phase 3 | 3-4 days | Planned |
| Phase 4 | 5-7 days | Planned |
| Phase 5 | 5-7 days | Planned |
| Phase 6 | 4-5 days | Planned |
| Phase 7 | 3-4 days | Planned |
| Phase 8 | 4-5 days | Planned |
| Phase 9 | 3-4 days | Planned |
| Phase 10 | 2-3 days | Planned |

**Total Estimate: 35-45 days** for a full production-ready application.

---

## Notes

- All dates are estimates and can vary based on complexity
- Testing should be integrated throughout, not just Phase 9
- Some phases can be parallelized
- MVP can be released after Phase 6
- Phase 7-8 can run concurrently
