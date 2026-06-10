-- Migration 002: Create ideas and roadmap_items tables

CREATE TABLE IF NOT EXISTS public.ideas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL    DEFAULT '',
  category    TEXT        NOT NULL    DEFAULT 'General',
  votes       INT         NOT NULL    DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL    DEFAULT '',
  status      TEXT        NOT NULL    DEFAULT 'planned',  -- 'in-progress' | 'planned' | 'done'
  sort_order  INT         NOT NULL    DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);
