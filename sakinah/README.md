# SAKINAH - سكينة

Transform Quranic recitations into stunning cinematic videos with AI-powered analysis and professional video generation.

🌍 **Multilingual**: Full support for Arabic (RTL) and English (LTR)  
📱 **iOS First**: Built with Expo for seamless iOS experience  
🎥 **Professional**: Cinema-grade video generation with FFmpeg  
🤖 **AI-Powered**: Intelligent Quranic recitation analysis and verse matching  
💎 **Premium**: Freemium model with RevenueCat subscriptions  

---

## Quick Start

### Prerequisites
- Node.js v22.23.4 or higher
- npm v10.9.9 or higher
- iOS device or simulator (for testing)
- Supabase account (free tier available)
- RevenueCat account (optional, for subscriptions)

### Installation

1. **Clone and install dependencies**
   ```bash
   cd sakinah
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```
   Then press `i` to open iOS simulator or scan QR code with iPhone.

---

## Project Structure

```
src/
├── screens/           # Expo Router screens
├── components/        # Reusable UI components
├── services/          # API & business logic
├── hooks/             # Custom React hooks
├── types/             # TypeScript definitions
├── constants/         # App constants
├── utils/             # Utility functions
├── config/            # Configuration (Supabase, etc.)
├── theme/             # Design system
├── i18n/              # Internationalization
└── store/             # Zustand state management
```

---

## Setup Guides

### 1. Supabase Configuration

1. **Create a Supabase project**: https://app.supabase.com
2. **Apply database migrations**:
   ```bash
   supabase db push
   ```
3. **Enable authentication methods**:
   - Email/Password
   - Google OAuth
   - Apple OAuth

4. **Configure storage buckets** (auto-created by migrations):
   - `audio-files` (private)
   - `video-renders` (private)
   - `backgrounds` (private)
   - `thumbnails` (public)
   - `user-avatars` (public)

5. **Get your credentials** from Project Settings > API
   - Copy `URL` → `EXPO_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 2. RevenueCat Setup (Subscriptions)

1. Create a RevenueCat account: https://www.revenuecat.com
2. Create an app and get your API key
3. Configure subscription products (Free, Pro, Premium)
4. Set `EXPO_PUBLIC_REVENUE_CAT_API_KEY` in `.env`

### 3. AI Recitation Analysis Service

The app requires a backend service for:
- Quranic recitation analysis
- Surah identification
- Verse timing extraction

Create a FastAPI/Node.js backend with:
```
POST /api/analyze-recitation
  - Input: audio file (mp3, m4a, wav)
  - Output: { surah, verses[], confidence }
```

Set `EXPO_PUBLIC_PROCESSING_API_URL` in `.env`.

### 4. FFmpeg Backend (Video Generation)

Set up a video processing service (e.g., AWS Lambda, Railway):
```
POST /api/render-video
  - Input: { audioUrl, format, quality, edits }
  - Output: { videoUrl, duration, fileSize }
```

---

## Development Workflow

### Available Commands

```bash
# Start development server
npx expo start

# TypeScript type checking
npx tsc --noEmit

# Run linter
npx expo lint

# Format code
npx prettier --write .

# Run tests (when configured)
npm test

# Build for iOS with EAS
npx eas-cli build --platform ios

# Submit to App Store
npx eas-cli submit --platform ios
```

### Database Migrations

```bash
# Create a new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database (dev only)
supabase db reset
```

---

## Implementation Roadmap

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed phases:

1. ✅ **Phase 1**: Foundation & Infrastructure (Current)
2. 🔄 **Phase 2**: Authentication & User Management
3. ⏳ **Phase 3**: Core Data Management
4. ⏳ **Phase 4**: AI Recitation Analysis
5. ⏳ **Phase 5**: Video Editor UI
6. ⏳ **Phase 6**: Video Rendering & Export
7. ⏳ **Phase 7**: Subscription & Monetization
8. ⏳ **Phase 8**: Admin Dashboard
9. ⏳ **Phase 9**: Testing & QA
10. ⏳ **Phase 10**: Deployment & Launch

---

## Code Style & Standards

- **TypeScript**: Strict mode enabled
- **Path Aliases**: Use `@components/`, `@services/`, etc.
- **Naming**:
  - Components: `PascalCase` (e.g., `UserProfile.tsx`)
  - Utils/Services: `camelCase` (e.g., `authService.ts`)
  - Types: In `src/types/index.ts`
  - Constants: UPPERCASE (e.g., `MAX_FILE_SIZE`)

### Pre-commit Checklist
```bash
npx tsc --noEmit    # Check types
npx expo lint       # Lint code
npm run format      # Format with Prettier
```

---

## Security Best Practices

✅ **Environment Variables**: All secrets in `.env` (never committed)  
✅ **Row Level Security**: All user data protected with Supabase RLS  
✅ **Secure Storage**: Use `expo-secure-store` for sensitive data  
✅ **HTTPS Only**: All API calls encrypted  
✅ **User Isolation**: Each user can only access their own data  
✅ **No Hardcoded Keys**: Configuration through environment variables  

---

## Troubleshooting

### "Cannot find module '@types/index'"
Make sure paths are configured in `tsconfig.json` and your IDE is indexing the project correctly.

### Supabase Connection Issues
- Verify `.env` variables are set correctly
- Check network connectivity
- Ensure Supabase project is active

### iOS Simulator Issues
```bash
# Reset metro bundler
npx expo start --clear

# Reset iOS simulator
xcrun simctl erase all
```

---

## Documentation

- 📖 [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- 🗄️ [Database Schema](./supabase/migrations/001_initial_schema.sql)
- 🎨 [Design System](./src/theme/)
- 🌍 [i18n Configuration](./src/i18n/)
- ⚙️ [Environment Setup](./env.example)

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run type check and linting
4. Commit with clear messages
5. Push and create a PR

---

## License

MIT License - See LICENSE file for details

---

## Support

For issues, feature requests, or questions:
- 📧 Email: support@sakinah.app
- 💬 Discord: [Join our server](https://discord.gg/sakinah)
- 📱 Twitter: [@SakinahApp](https://twitter.com/sakinahapp)

---

## Credits

Built with ❤️ using:
- [Expo](https://expo.dev) - React Native framework
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [TypeScript](https://www.typescriptlang.org) - Type-safe JavaScript
- [React Native](https://reactnative.dev) - Mobile app development

**Version**: 0.1.0 (Alpha)  
**Last Updated**: November 2026
