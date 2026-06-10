// ── Database client ───────────────────────────────────────────────────────────
// Currently uses Supabase. To migrate to a different database:
//   1. Replace this file with your own connection (pg, mysql2, prisma, etc.)
//   2. Update each file in ../routes/ to use your new client
//   3. The rest of the app stays the same.

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
}

export const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
