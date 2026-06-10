-- Migration 001: Create responses table

CREATE TABLE IF NOT EXISTS public.responses (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  role         TEXT        NOT NULL    DEFAULT '',
  q1           TEXT        NOT NULL    DEFAULT '',
  q2           TEXT        NOT NULL    DEFAULT '',
  q3           TEXT        NOT NULL    DEFAULT '',
  q4           TEXT        NOT NULL    DEFAULT '',
  q5           TEXT        NOT NULL    DEFAULT '',
  q6           TEXT        NOT NULL    DEFAULT '',
  q7           TEXT        NOT NULL    DEFAULT '',
  q8           TEXT        NOT NULL    DEFAULT '',
  q9           TEXT        NOT NULL    DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_responses_submitted_at
  ON public.responses (submitted_at DESC);
