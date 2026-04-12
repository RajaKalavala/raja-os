-- ============================================
-- RajaOS Health MFE — Supabase Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Health Vitals (time-series from Apple Health / manual)
CREATE TABLE IF NOT EXISTS health_vitals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type   TEXT NOT NULL,
  value         NUMERIC NOT NULL,
  unit          TEXT NOT NULL,
  source        TEXT NOT NULL DEFAULT 'manual',
  device_name   TEXT,
  recorded_at   TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_vitals_user_metric
  ON health_vitals(user_id, metric_type, recorded_at DESC);

ALTER TABLE health_vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own vitals" ON health_vitals FOR ALL USING (auth.uid() = user_id);

-- 2. Health Documents (Medical Vault)
CREATE TABLE IF NOT EXISTS health_documents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  document_type         TEXT NOT NULL DEFAULT 'other',
  storage_path          TEXT NOT NULL,
  file_name             TEXT NOT NULL,
  file_type             TEXT NOT NULL,
  file_size_bytes       BIGINT,
  body_systems          TEXT[] DEFAULT '{}',
  document_date         DATE,
  provider_name         TEXT,
  facility_name         TEXT,
  tags                  TEXT[] DEFAULT '{}',
  ai_extraction_status  TEXT NOT NULL DEFAULT 'pending',
  ai_summary            TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE health_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own documents" ON health_documents FOR ALL USING (auth.uid() = user_id);

-- 3. Health Document Extractions (AI-extracted structured data)
CREATE TABLE IF NOT EXISTS health_document_extractions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id         UUID NOT NULL REFERENCES health_documents(id) ON DELETE CASCADE,
  extraction_type     TEXT NOT NULL,
  label               TEXT NOT NULL,
  value               TEXT NOT NULL,
  value_numeric       NUMERIC,
  unit                TEXT,
  reference_range_low   NUMERIC,
  reference_range_high  NUMERIC,
  is_flagged          BOOLEAN DEFAULT FALSE,
  flag_direction      TEXT,
  body_system         TEXT,
  confidence          NUMERIC,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE health_document_extractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own extractions" ON health_document_extractions FOR ALL USING (auth.uid() = user_id);

-- 4. Health Lab Results (normalized biomarker tracking)
CREATE TABLE IF NOT EXISTS health_lab_results (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id     UUID REFERENCES health_documents(id) ON DELETE SET NULL,
  biomarker_name  TEXT NOT NULL,
  biomarker_key   TEXT NOT NULL,
  panel           TEXT,
  value           NUMERIC NOT NULL,
  unit            TEXT NOT NULL,
  reference_low   NUMERIC,
  reference_high  NUMERIC,
  is_flagged      BOOLEAN DEFAULT FALSE,
  flag_direction  TEXT,
  lab_date        DATE NOT NULL,
  lab_name        TEXT,
  ordered_by      TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_lab_user_key
  ON health_lab_results(user_id, biomarker_key, lab_date DESC);

ALTER TABLE health_lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own labs" ON health_lab_results FOR ALL USING (auth.uid() = user_id);

-- 5. Health Medications
CREATE TABLE IF NOT EXISTS health_medications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  category          TEXT NOT NULL DEFAULT 'medication',
  dosage            TEXT NOT NULL,
  frequency         TEXT NOT NULL,
  times_of_day      TEXT[] DEFAULT '{}',
  route             TEXT,
  prescribed_by     TEXT,
  prescribed_for    TEXT,
  start_date        DATE NOT NULL,
  end_date          DATE,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_times    TEXT[] DEFAULT '{}',
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE health_medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own medications" ON health_medications FOR ALL USING (auth.uid() = user_id);

-- 6. Health Medication Logs (adherence tracking)
CREATE TABLE IF NOT EXISTS health_medication_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id   UUID NOT NULL REFERENCES health_medications(id) ON DELETE CASCADE,
  log_date        DATE NOT NULL,
  taken           BOOLEAN NOT NULL,
  taken_at        TIMESTAMPTZ,
  skipped_reason  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, medication_id, log_date)
);

ALTER TABLE health_medication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own med logs" ON health_medication_logs FOR ALL USING (auth.uid() = user_id);

-- 7. Health Daily Log (subjective wellness tracking)
CREATE TABLE IF NOT EXISTS health_daily_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date      DATE NOT NULL,
  mood_score    SMALLINT CHECK (mood_score BETWEEN 1 AND 10),
  energy_score  SMALLINT CHECK (energy_score BETWEEN 1 AND 10),
  stress_score  SMALLINT CHECK (stress_score BETWEEN 1 AND 10),
  sleep_quality SMALLINT CHECK (sleep_quality BETWEEN 1 AND 10),
  symptoms      TEXT[] DEFAULT '{}',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, log_date)
);

ALTER TABLE health_daily_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own daily log" ON health_daily_log FOR ALL USING (auth.uid() = user_id);

-- 8. Health Goals
CREATE TABLE IF NOT EXISTS health_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,
  metric_type     TEXT,
  biomarker_key   TEXT,
  target_value    NUMERIC,
  target_unit     TEXT,
  baseline_value  NUMERIC,
  current_value   NUMERIC,
  deadline        DATE,
  status          TEXT NOT NULL DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own health goals" ON health_goals FOR ALL USING (auth.uid() = user_id);

-- 9. Health Chat Sessions
CREATE TABLE IF NOT EXISTS health_chat_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  model_used  TEXT,
  session_id  UUID NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE health_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own health chats" ON health_chat_sessions FOR ALL USING (auth.uid() = user_id);

-- 10. Health Profile (Emergency Card)
CREATE TABLE IF NOT EXISTS health_profile (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  blood_type          TEXT,
  allergies           JSONB DEFAULT '[]',
  chronic_conditions  TEXT[] DEFAULT '{}',
  primary_physician   JSONB,
  emergency_contacts  JSONB DEFAULT '[]',
  insurance           JSONB,
  organ_donor         BOOLEAN,
  advance_directive   BOOLEAN,
  height_cm           NUMERIC,
  date_of_birth       DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE health_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON health_profile FOR ALL USING (auth.uid() = user_id);

-- 11. Health Import Sessions (Apple Health tracking)
CREATE TABLE IF NOT EXISTS health_import_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  import_date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  source            TEXT NOT NULL DEFAULT 'apple_health_xml',
  file_name         TEXT,
  records_parsed    INTEGER DEFAULT 0,
  records_inserted  INTEGER DEFAULT 0,
  records_skipped   INTEGER DEFAULT 0,
  date_range_start  DATE,
  date_range_end    DATE,
  status            TEXT NOT NULL DEFAULT 'completed',
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE health_import_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own imports" ON health_import_sessions FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Supabase Storage Bucket for Medical Documents
-- Run this separately or via Supabase dashboard:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('health-documents', 'health-documents', false);
--
-- CREATE POLICY "Users manage own health docs"
-- ON storage.objects FOR ALL
-- USING (bucket_id = 'health-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
-- ============================================
