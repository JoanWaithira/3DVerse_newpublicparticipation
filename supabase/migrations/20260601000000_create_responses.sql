-- Migration: 20260601000000_create_responses
-- Description: Initial responses table for Aadorp Digital Twin survey
--
-- How to apply:
--   Option A (Supabase CLI): supabase db push
--   Option B (manual):       paste into Supabase Dashboard → SQL Editor → Run
--
-- Future migrations go in new files:
--   20260601000001_add_session_id.sql
--   20260601000002_add_locale_column.sql
--   etc.

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.responses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  q1           TEXT        NOT NULL    DEFAULT '',   -- home info priority
  q2           TEXT        NOT NULL    DEFAULT '',   -- preferred scale
  q3           TEXT        NOT NULL    DEFAULT '',   -- display format
  q4           TEXT        NOT NULL    DEFAULT '',   -- comparison periods (pipe-separated)
  q5           TEXT        NOT NULL    DEFAULT '',   -- open solutions (pipe-separated)
  q6           TEXT        NOT NULL    DEFAULT '',   -- AI assistant yes/no
  q7           TEXT        NOT NULL    DEFAULT '',   -- additional topics (pipe-separated)
  q8           TEXT        NOT NULL    DEFAULT '',   -- respondent role
  q9           TEXT        NOT NULL    DEFAULT ''    -- open comments
);

-- ── Index ────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_responses_submitted_at
  ON public.responses (submitted_at DESC);

-- ── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Anyone (anon) can submit the survey
CREATE POLICY "anon_insert_responses"
  ON public.responses FOR INSERT
  TO anon WITH CHECK (true);

-- Anyone can read responses (public dashboard)
CREATE POLICY "anon_select_responses"
  ON public.responses FOR SELECT
  TO anon USING (true);

-- Anyone can delete for now (restrict to authenticated once admin auth is added)
-- To lock this down later: replace `anon` with `authenticated` below.
CREATE POLICY "anon_delete_responses"
  ON public.responses FOR DELETE
  TO anon USING (true);
