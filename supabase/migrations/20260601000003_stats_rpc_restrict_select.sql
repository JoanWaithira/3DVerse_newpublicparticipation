-- Migration: 20260601000003_stats_rpc_restrict_select
-- Description: Restrict anon from reading individual response rows.
--              Add get_survey_stats() RPC (SECURITY DEFINER) so the public
--              dashboard can show aggregated stats without exposing raw data.

-- 1. Tighten SELECT policy: only authenticated users can read individual rows
DROP POLICY IF EXISTS "allow_select_responses" ON public.responses;

CREATE POLICY "auth_select_responses"
  ON public.responses FOR SELECT
  TO authenticated
  USING (true);

-- 2. Aggregated stats function accessible to anon
CREATE OR REPLACE FUNCTION public.get_survey_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH q2_top AS (
    SELECT q2 AS label, COUNT(*) AS cnt
    FROM responses
    WHERE q2 <> ''
    GROUP BY q2
    ORDER BY cnt DESC
    LIMIT 4
  ),
  q3_top AS (
    SELECT q3 AS label, COUNT(*) AS cnt
    FROM responses
    WHERE q3 <> ''
    GROUP BY q3
    ORDER BY cnt DESC
    LIMIT 4
  ),
  q7_top AS (
    SELECT TRIM(val) AS label, COUNT(*) AS cnt
    FROM responses,
         UNNEST(STRING_TO_ARRAY(q7, ' | ')) AS val
    WHERE q7 <> ''
    GROUP BY TRIM(val)
    ORDER BY cnt DESC
    LIMIT 4
  )
  SELECT json_build_object(
    'total',   (SELECT COUNT(*)                           FROM responses),
    'ai_yes',  (SELECT COUNT(*) FROM responses WHERE q8 = 'Yes please'),
    'q2',      (SELECT COALESCE(json_agg(json_build_array(label, cnt)), '[]'::json) FROM q2_top),
    'q3',      (SELECT COALESCE(json_agg(json_build_array(label, cnt)), '[]'::json) FROM q3_top),
    'q7',      (SELECT COALESCE(json_agg(json_build_array(label, cnt)), '[]'::json) FROM q7_top)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_survey_stats() TO anon;
