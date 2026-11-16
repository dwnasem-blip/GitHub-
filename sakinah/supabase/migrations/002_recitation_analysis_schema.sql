-- Recitation Analysis Schema
-- Tables for Quranic recitation review and analysis

-- Tajweed Rules table
CREATE TABLE IF NOT EXISTS tajweed_rules (
  id TEXT PRIMARY KEY,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  is_definitive BOOLEAN DEFAULT TRUE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tajweed_rules_category ON tajweed_rules(category);
CREATE INDEX IF NOT EXISTS idx_tajweed_rules_name_ar ON tajweed_rules(name_ar);

-- Reference Readers table
CREATE TABLE IF NOT EXISTS reference_readers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reference Audio table (for storing cached reference audio URLs)
CREATE TABLE IF NOT EXISTS reference_audio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  verse_number INTEGER NOT NULL,
  reader_id TEXT NOT NULL REFERENCES reference_readers(id) ON DELETE CASCADE,
  reader_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reference_audio_surah ON reference_audio(surah_number);
CREATE INDEX IF NOT EXISTS idx_reference_audio_verse ON reference_audio(verse_number);
CREATE INDEX IF NOT EXISTS idx_reference_audio_reader ON reference_audio(reader_id);

-- Quranic Verses table (for storing canonical Quranic text)
CREATE TABLE IF NOT EXISTS quran_verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  verse_number INTEGER NOT NULL,
  arabic_text TEXT NOT NULL,
  english_translation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_quran_verses_unique ON quran_verses(surah_number, verse_number);
CREATE INDEX IF NOT EXISTS idx_quran_verses_surah ON quran_verses(surah_number);

-- Recitation Reviews table
CREATE TABLE IF NOT EXISTS recitation_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  audio_file_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  surah_name_ar TEXT NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER NOT NULL,

  status TEXT DEFAULT 'analyzing' CHECK (status IN ('analyzing', 'completed', 'failed')),

  total_words INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  overall_confidence NUMERIC(3, 2) CHECK (overall_confidence >= 0 AND overall_confidence <= 1),

  reference_audio_url TEXT,
  reference_reader TEXT,

  final_report JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recitation_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recitation reviews for their projects" ON recitation_reviews
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert recitation reviews for their projects" ON recitation_reviews
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update recitation reviews for their projects" ON recitation_reviews
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete recitation reviews for their projects" ON recitation_reviews
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_recitation_reviews_project_id ON recitation_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_recitation_reviews_audio_file_id ON recitation_reviews(audio_file_id);
CREATE INDEX IF NOT EXISTS idx_recitation_reviews_status ON recitation_reviews(status);
CREATE INDEX IF NOT EXISTS idx_recitation_reviews_created_at ON recitation_reviews(created_at DESC);

-- Recitation Findings table
CREATE TABLE IF NOT EXISTS recitation_findings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES recitation_reviews(id) ON DELETE CASCADE,

  word_number INTEGER,
  verse_number INTEGER,
  word_text TEXT,
  word_arabic TEXT,

  start_time NUMERIC(10, 2),
  end_time NUMERIC(10, 2),

  type TEXT NOT NULL CHECK (type IN (
    'missing_word', 'extra_word', 'wrong_word', 'pronunciation', 'tajweed',
    'elongation', 'nasalization', 'assimilation', 'concealment', 'manifestation', 'vibration'
  )),
  severity TEXT CHECK (severity IN ('error', 'probable', 'inconclusive')),
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1),

  expected TEXT,
  detected TEXT,
  description JSONB, -- {ar: "", en: ""}

  tajweed_rule JSONB, -- {name_ar, name_en, description, is_definitive}

  suggestions TEXT[],
  reference_audio_segment TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recitation_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view recitation findings for their reviews" ON recitation_findings
  FOR SELECT USING (
    review_id IN (
      SELECT id FROM recitation_reviews WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert recitation findings for their reviews" ON recitation_findings
  FOR INSERT WITH CHECK (
    review_id IN (
      SELECT id FROM recitation_reviews WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete recitation findings for their reviews" ON recitation_findings
  FOR DELETE USING (
    review_id IN (
      SELECT id FROM recitation_reviews WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_recitation_findings_review_id ON recitation_findings(review_id);
CREATE INDEX IF NOT EXISTS idx_recitation_findings_verse_number ON recitation_findings(verse_number);
CREATE INDEX IF NOT EXISTS idx_recitation_findings_type ON recitation_findings(type);
CREATE INDEX IF NOT EXISTS idx_recitation_findings_severity ON recitation_findings(severity);
CREATE INDEX IF NOT EXISTS idx_recitation_findings_start_time ON recitation_findings(start_time);

-- Storage bucket for reference audio (if using Supabase Storage)
-- This would be created through the Supabase UI or CLI
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('reference-audio', 'reference-audio', true, 52428800, '{"audio/*"}');

-- Storage bucket for user recitation audio
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('recitation-audio', 'recitation-audio', false, 104857600, '{"audio/*"}');
