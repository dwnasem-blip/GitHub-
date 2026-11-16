# SAKINAH AI - Phase 2: Task Distribution Plan
# المرحلة الثانية: خطة توزيع المهام

**Start Date**: November 16, 2026  
**Phase**: 2 - Authentication & User Management  
**Duration**: 3-4 days  
**Status**: 🚀 Starting Parallel Development

---

## 👥 Team Structure

| Agent | Role | Responsibility | Branch |
|-------|------|-----------------|--------|
| **Coordinator** | Main | Task distribution, coordination, review, merge | `main` |
| **Agent 1** | Auth | Authentication, login, signup, password reset | `feature/auth-system` |
| **Agent 2** | Data | Projects, profiles, database integration | `feature/data-management` |
| **Agent 3** | Audio | Audio upload, validation, storage setup | `feature/audio-handling` |
| **Agent 4** | UI | Components, design system implementation | `feature/ui-components` |

---

## 🎯 Detailed Task Breakdown

### Agent 1: Authentication System
**Branch**: `feature/auth-system`  
**Files to Create/Modify**:
```
src/services/authService.ts         ← Main auth service
src/screens/auth/
  ├── SignUpScreen.tsx
  ├── LoginScreen.tsx
  ├── ForgotPasswordScreen.tsx
  └── ResetPasswordScreen.tsx
src/hooks/useAuth.ts                ← Auth hook
src/context/AuthContext.tsx         ← Auth provider
src/app/(auth)/
  ├── _layout.tsx
  ├── sign-up.tsx
  ├── login.tsx
  └── forgot-password.tsx
```

**Dependencies**: Supabase Auth, Zustand (authStore), i18n

**Key Interfaces**:
```typescript
interface AuthService {
  signUp(email: string, password: string, fullName: string): Promise<User>
  login(email: string, password: string): Promise<User>
  logout(): Promise<void>
  resetPassword(email: string): Promise<void>
  getCurrentUser(): Promise<User | null>
  updateProfile(data: Partial<Profile>): Promise<Profile>
}
```

**Definition of Done**:
- ✅ All 4 screens functional
- ✅ Supabase Auth integration working
- ✅ Email validation
- ✅ Password strength checking
- ✅ Error handling
- ✅ Session persistence
- ✅ RTL/LTR support in forms
- ✅ No hardcoded secrets

---

### Agent 2: Data Management
**Branch**: `feature/data-management`  
**Files to Create/Modify**:
```
src/services/projectService.ts      ← Project CRUD
src/services/profileService.ts      ← Profile management
src/services/databaseService.ts     ← DB utilities
src/screens/home/
  ├── HomeScreen.tsx
  ├── ProfileScreen.tsx
  └── ProjectsListScreen.tsx
src/hooks/useProjects.ts            ← Projects hook
src/hooks/useProfile.ts             ← Profile hook
src/store/projectStore.ts           ← Project state
src/app/(app)/
  ├── _layout.tsx
  ├── index.tsx                      ← Home
  ├── projects/
  │   ├── [id].tsx                   ← Project detail
  │   └── new.tsx                    ← Create project
  └── profile.tsx
```

**Dependencies**: Supabase, types, theme, i18n

**Key Interfaces**:
```typescript
interface ProjectService {
  listProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project>
  createProject(data: CreateProjectInput): Promise<Project>
  updateProject(id: string, data: Partial<Project>): Promise<Project>
  deleteProject(id: string): Promise<void>
}

interface ProfileService {
  getProfile(): Promise<Profile>
  updateProfile(data: Partial<Profile>): Promise<Profile>
  uploadAvatar(file: File): Promise<string>
}
```

**RLS Verification**:
- Verify users can only access their own projects
- Verify profile isolation
- Test data access controls

**Definition of Done**:
- ✅ All CRUD operations
- ✅ RLS policies enforced
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states
- ✅ Pagination if needed
- ✅ Real data from Supabase (no mocks)

---

### Agent 3: Audio Handling
**Branch**: `feature/audio-handling`  
**Files to Create/Modify**:
```
src/services/audioService.ts        ← Audio upload/validation
src/services/storageService.ts      ← Supabase storage
src/screens/audio/
  ├── UploadScreen.tsx
  ├── RecordScreen.tsx
  └── AudioListScreen.tsx
src/hooks/useAudioUpload.ts         ← Upload hook
src/hooks/useAudioRecord.ts         ← Recording hook
src/app/(app)/audio/
  ├── upload.tsx
  ├── record.tsx
  └── list.tsx
```

**Dependencies**: expo-av, Supabase Storage, types, i18n

**Key Interfaces**:
```typescript
interface AudioService {
  validateAudioFile(file: File): Promise<ValidationResult>
  uploadAudio(projectId: string, file: File): Promise<AudioFile>
  deleteAudio(audioId: string): Promise<void>
  getAudioUrl(audioId: string): Promise<string>
  startRecording(): Promise<void>
  stopRecording(): Promise<string>
}

interface ValidationResult {
  valid: boolean
  error?: string
  duration?: number
  size?: number
}
```

**Supported Formats**: MP3, M4A, WAV (validate before upload)

**Storage Setup**:
- Configure Supabase bucket: `audio-files/{userId}/{projectId}/{audioId}`
- Implement resumable uploads
- Error retry logic

**Definition of Done**:
- ✅ File upload working
- ✅ Format validation
- ✅ Size validation (500MB limit)
- ✅ Recording functionality
- ✅ Progress tracking
- ✅ Error handling
- ✅ Storage policies enforced
- ✅ Real upload to Supabase (no mocks)

---

### Agent 4: UI Components & Design System
**Branch**: `feature/ui-components`  
**Files to Create/Modify**:
```
src/components/
  ├── Button.tsx
  ├── Input.tsx
  ├── Card.tsx
  ├── Loading.tsx
  ├── ErrorBoundary.tsx
  ├── SafeAreaView.tsx
  ├── TabBar.tsx
  ├── Modal.tsx
  ├── forms/
  │   ├── FormInput.tsx
  │   ├── FormSelect.tsx
  │   └── FormSubmitButton.tsx
  ├── typography/
  │   ├── Heading.tsx
  │   ├── Text.tsx
  │   └── Caption.tsx
  └── layout/
      ├── Container.tsx
      ├── Section.tsx
      └── Divider.tsx
src/theme/
  └── useTheme.ts                   ← Theme hook
src/utils/
  ├── styleUtils.ts                 ← Styling helpers
  └── layoutUtils.ts                ← Layout helpers
```

**Key Features**:
- RTL/LTR support
- Dark theme implementation
- Responsive design
- Accessibility

**Component API**:
```typescript
// Button
<Button 
  variant="primary" | "secondary" | "outline"
  size="sm" | "md" | "lg"
  disabled={boolean}
  onPress={() => {}}
  label="Click me"
/>

// Input
<FormInput
  label="Email"
  placeholder="user@example.com"
  value={value}
  onChangeText={onChange}
  error={error}
  rtl={isArabic}
/>

// Card
<Card padding="lg" shadow="md">
  Content here
</Card>
```

**Definition of Done**:
- ✅ All components created
- ✅ RTL/LTR fully functional
- ✅ Dark theme applied
- ✅ Responsive design
- ✅ Accessibility implemented
- ✅ Storybook/documentation (optional)
- ✅ Reusable across all screens

---

## 🔗 Integration Points (Critical)

### Between Agent 1 & 4 (Auth × UI)
```typescript
// Use Button, Input, Card from Agent 4
import { Button, FormInput, Card } from '@components'
// Follow typography from Agent 4
import { Heading, Text } from '@components/typography'
```

**Interface**: UI components must accept `rtl` prop for Arabic support

### Between Agent 2 & 4 (Data × UI)
```typescript
// Use Card, Loading from Agent 4 for project list
// Use FormInput from Agent 4 for profile edit
```

**Interface**: Loading and empty states standardized

### Between Agent 3 & 4 (Audio × UI)
```typescript
// Use Button, Input, Loading from Agent 4
// Audio progress should use standard loading patterns
```

**Interface**: Progress bar component standardized

### Between Agent 1 & 2 (Auth × Data)
```typescript
// After login (Agent 1), fetch user projects (Agent 2)
// useAuth() hook + useProjects() hook integration
```

**Interface**: Coordinate through Supabase Auth session

### Between All & Coordinator
- Create feature branch before starting
- Push daily commits
- Alert coordinator on blockers
- Use defined interfaces

---

## 📋 Development Checklist

### Before Starting
- [ ] All agents review this document
- [ ] Supabase project created and credentials shared
- [ ] Database migrations applied
- [ ] Git branches created
- [ ] No API keys in code
- [ ] Environment variables configured

### During Development
- [ ] Use `console.log()` for debugging (remove before commit)
- [ ] No hardcoded data or test accounts
- [ ] Real API calls only
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] RTL/LTR support in all UI
- [ ] TypeScript strict mode compliance

### Before Merging
- [ ] Code review by coordinator
- [ ] Type checking: `npx tsc --noEmit`
- [ ] Linting: `npx expo lint`
- [ ] Manual testing on iOS simulator
- [ ] No console errors/warnings
- [ ] Git commit with clear message
- [ ] PR created with description

---

## 🧪 Testing Strategy

### Agent 1 (Auth)
```bash
# Test cases
✅ Sign up with valid email
✅ Sign up with weak password
✅ Sign up with existing email
✅ Login with correct credentials
✅ Login with wrong credentials
✅ Password reset flow
✅ Session persistence after app restart
```

### Agent 2 (Data)
```bash
# Test cases
✅ Create project
✅ List projects (verify RLS)
✅ Update project
✅ Delete project
✅ Access another user's project (should fail)
✅ Edit profile
✅ Upload avatar
```

### Agent 3 (Audio)
```bash
# Test cases
✅ Upload MP3 file
✅ Upload WAV file
✅ Reject unsupported format
✅ Reject file > 500MB
✅ Record audio
✅ Playback uploaded audio
✅ Delete audio file
```

### Agent 4 (UI)
```bash
# Test cases
✅ All components render
✅ RTL layout correct
✅ Dark theme applied
✅ Responsive on different screen sizes
✅ Buttons are clickable
✅ Forms accept input
✅ Loading states visible
```

---

## 🚨 Critical Do's and Don'ts

### ✅ DO
- Use real Supabase API calls
- Implement proper error handling
- Test on iOS simulator before commit
- Use TypeScript types
- Follow file naming conventions
- Coordinate with coordinator for conflicts
- Keep commits focused and small
- Use i18n for all user-facing strings
- Implement loading states
- Use environment variables for config

### ❌ DON'T
- Use mock data or dummy API responses
- Hardcode API keys or secrets
- Modify another agent's files without coordination
- Leave `console.log()` in production code
- Commit without testing
- Use `any` type (use `unknown` or proper types)
- Ignore TypeScript errors
- Skip error handling
- Modify git history
- Create merge conflicts

---

## 📅 Timeline

| Day | Tasks |
|-----|-------|
| Day 1 | Setup branches, review plan, start implementations |
| Day 2 | Main feature development |
| Day 3 | Integration testing, bug fixes |
| Day 4 | Final review, merge, polish |

---

## 📞 Communication Protocol

**Coordinator Checks**:
- 🔵 Morning: Review all branches, check progress
- 🔵 Midday: Resolve blockers, approve PRs
- 🔵 Evening: Final review, merge approved code
- 🔵 On-demand: Handle merge conflicts

**Agent Communication**:
- Use this document for reference
- Alert coordinator on blockers
- Request interface changes early
- Commit regularly (at least daily)

---

## 🎯 Success Criteria

**Phase 2 is complete when**:
1. ✅ Users can sign up, login, password reset
2. ✅ Users can manage projects and profiles
3. ✅ Users can upload audio files
4. ✅ All screens use professional UI components
5. ✅ RTL/LTR works throughout the app
6. ✅ No hardcoded secrets or test data
7. ✅ All code passes TypeScript check
8. ✅ Manual testing on iOS passes
9. ✅ All branches merged to main
10. ✅ Documentation updated

---

**Version**: 1.0  
**Last Updated**: November 16, 2026  
**Status**: 🚀 Ready to Execute
