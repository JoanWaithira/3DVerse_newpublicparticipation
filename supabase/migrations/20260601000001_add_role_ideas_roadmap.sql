-- Migration: 20260601000001_add_role_ideas_roadmap
-- Description: Adds role column to responses, creates ideas and roadmap_items tables
--
-- How to apply:
--   Option A (Supabase CLI): supabase db push
--   Option B (manual):       paste into Supabase Dashboard → SQL Editor → Run

-- ── 1. Add role column to existing responses table ───────────────────────────

ALTER TABLE public.responses
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT '';

-- ── 2. Wishlist ideas table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.ideas (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL    DEFAULT '',
  category    TEXT        NOT NULL    DEFAULT 'General',
  votes       INT         NOT NULL    DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_ideas"
  ON public.ideas FOR SELECT
  TO anon USING (true);

CREATE POLICY "anon_insert_ideas"
  ON public.ideas FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "anon_update_ideas"
  ON public.ideas FOR UPDATE
  TO anon USING (true);

CREATE POLICY "auth_delete_ideas"
  ON public.ideas FOR DELETE
  TO authenticated USING (true);

-- ── 3. Roadmap items table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL    DEFAULT '',
  status      TEXT        NOT NULL    DEFAULT 'planned',  -- 'in-progress' | 'planned' | 'done'
  sort_order  INT         NOT NULL    DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL    DEFAULT NOW()
);

ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_roadmap"
  ON public.roadmap_items FOR SELECT
  TO anon USING (true);

CREATE POLICY "auth_manage_roadmap"
  ON public.roadmap_items FOR ALL
  TO authenticated USING (true);

-- ── 4. Seed initial roadmap items (matches the old static content) ───────────

INSERT INTO public.roadmap_items (title, description, status, sort_order) VALUES
  ('Public dashboard refinement',  'Near-term delivery',          'in-progress', 1),
  ('Safer school route concept',   'Co-design with residents',    'in-progress', 2),
  ('Energy coaching series',       'Autumn rollout',              'planned',     3),
  ('Open data indicators',         'Quality checks in progress',  'planned',     4)
ON CONFLICT DO NOTHING;
