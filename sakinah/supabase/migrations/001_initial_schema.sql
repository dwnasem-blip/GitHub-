-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- User Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  language TEXT DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- Audio Files table
CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  duration INTEGER, -- in seconds
  size INTEGER, -- in bytes
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audio files" ON audio_files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio files" ON audio_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audio files" ON audio_files
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_audio_files_project_id ON audio_files(project_id);
CREATE INDEX idx_audio_files_user_id ON audio_files(user_id);

-- Recitation Matches table
CREATE TABLE recitation_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audio_file_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  surah_name_ar TEXT NOT NULL,
  surah_name_en TEXT NOT NULL,
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recitation_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recitation matches for their audio files" ON recitation_matches
  FOR SELECT USING (
    audio_file_id IN (
      SELECT id FROM audio_files WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_recitation_matches_audio_file_id ON recitation_matches(audio_file_id);
CREATE INDEX idx_recitation_matches_surah_number ON recitation_matches(surah_number);

-- Verse Timings table
CREATE TABLE verse_timings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recitation_match_id UUID NOT NULL REFERENCES recitation_matches(id) ON DELETE CASCADE,
  verse_number INTEGER NOT NULL,
  arabic_text TEXT NOT NULL,
  english_translation TEXT,
  start_time NUMERIC(10, 2) NOT NULL, -- in seconds
  end_time NUMERIC(10, 2) NOT NULL,
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
  word_timings JSONB, -- Array of {word, start_time, end_time, confidence}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE verse_timings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view verse timings for their recitations" ON verse_timings
  FOR SELECT USING (
    recitation_match_id IN (
      SELECT rm.id FROM recitation_matches rm
      JOIN audio_files af ON rm.audio_file_id = af.id
      WHERE af.user_id = auth.uid()
    )
  );

CREATE INDEX idx_verse_timings_recitation_match_id ON verse_timings(recitation_match_id);

-- Backgrounds table (public + premium)
CREATE TABLE backgrounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('kaaba', 'mosque', 'nature', 'sky', 'urban', 'custom')),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  thumbnail_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE backgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-premium backgrounds" ON backgrounds
  FOR SELECT USING (NOT is_premium OR created_by = auth.uid());

CREATE POLICY "Users can upload custom backgrounds" ON backgrounds
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE INDEX idx_backgrounds_category ON backgrounds(category);
CREATE INDEX idx_backgrounds_is_premium ON backgrounds(is_premium);

-- Templates table (public + premium)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  font_family TEXT DEFAULT 'Cairo',
  font_size INTEGER DEFAULT 48,
  text_color TEXT DEFAULT '#ffffff',
  text_position JSONB DEFAULT '{"x": 50, "y": 70, "align": "center"}',
  animation_type TEXT DEFAULT 'fade' CHECK (animation_type IN (
    'fade', 'slide_up', 'slide_down', 'slide_left', 'slide_right',
    'zoom_in', 'zoom_out', 'scale_bounce'
  )),
  display_mode TEXT DEFAULT 'verse_by_verse' CHECK (display_mode IN ('word_by_word', 'verse_by_verse')),
  background_animation TEXT DEFAULT 'static' CHECK (background_animation IN (
    'static', 'slow_zoom', 'pan', 'fade_overlay', 'particle_effect'
  )),
  is_premium BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view non-premium templates" ON templates
  FOR SELECT USING (NOT is_premium OR created_by = auth.uid());

CREATE INDEX idx_templates_is_premium ON templates(is_premium);

-- Render Jobs table
CREATE TABLE render_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  format TEXT NOT NULL CHECK (format IN ('9:16', '16:9', '1:1')),
  quality TEXT NOT NULL CHECK (quality IN ('720p', '1080p', '4k')),
  output_url TEXT,
  error_message TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own render jobs" ON render_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own render jobs" ON render_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own render jobs" ON render_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_project_id ON render_jobs(project_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);

-- Rendered Videos table
CREATE TABLE rendered_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  render_job_id UUID NOT NULL UNIQUE REFERENCES render_jobs(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  file_size INTEGER, -- in bytes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rendered_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rendered videos" ON rendered_videos
  FOR SELECT USING (
    render_job_id IN (
      SELECT id FROM render_jobs WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_rendered_videos_render_job_id ON rendered_videos(render_job_id);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  revenucat_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);

-- Usage Records table
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  videos_created INTEGER DEFAULT 0,
  videos_limit INTEGER DEFAULT 5,
  storage_used INTEGER DEFAULT 0, -- in MB
  storage_limit INTEGER DEFAULT 1000, -- in MB
  processing_hours_used NUMERIC(10, 2) DEFAULT 0,
  processing_hours_limit NUMERIC(10, 2) DEFAULT 10,
  reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage records" ON usage_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_reset_date ON usage_records(reset_date);

-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_render_jobs_updated_at
  BEFORE UPDATE ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create Supabase storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('audio-files', 'audio-files', false),
  ('video-renders', 'video-renders', false),
  ('backgrounds', 'backgrounds', false),
  ('thumbnails', 'thumbnails', true),
  ('user-avatars', 'user-avatars', true)
ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload audio files to their own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'audio-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can download their own audio files" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'audio-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can download their rendered videos" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'video-renders'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view backgrounds" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'backgrounds');

CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can upload avatars to their folder" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can download avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-avatars');
