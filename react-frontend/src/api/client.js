import { supabase } from '../lib/supabase';

// ── Transform helpers ─────────────────────────────────────────────────────────

function toResponse(row) {
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    answers: {
      role: row.role || '',
      q1: row.q1 || '',
      q2: row.q2 || '',
      q3: row.q3 || '',
      q4: row.q4 || '',
      q5: row.q5 || '',
      q6: row.q6 || '',
      q7: row.q7 || '',
      q8: row.q8 || '',
      q9: row.q9 || '',
    },
  };
}

// ── Survey responses ──────────────────────────────────────────────────────────

export async function getResponses() {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return data.map(toResponse);
}

export async function submitResponse(answers) {
  const { data, error } = await supabase
    .from('responses')
    .insert([{
      role: answers.role || '',
      q1:   answers.q1  || '',
      q2:   answers.q2  || '',
      q3:   answers.q3  || '',
      q4:   answers.q4  || '',
      q5:   answers.q5  || '',
      q6:   answers.q6  || '',
      q7:   answers.q7  || '',
      q8:   answers.q8  || '',
      q9:   answers.q9  || '',
    }])
    .select()
    .single();
  if (error) throw error;
  // Fire-and-forget webhook notification (admin email alert)
  notifyNewSubmission(answers);
  return toResponse(data);
}

export async function deleteAllResponses() {
  const { error } = await supabase
    .from('responses')
    .delete()
    .not('id', 'is', null);
  if (error) throw error;
}

// ── Webhook notification (configure VITE_NOTIFY_WEBHOOK_URL in .env) ──────────

function notifyNewSubmission(answers) {
  const url = import.meta.env.VITE_NOTIFY_WEBHOOK_URL;
  if (!url) return;
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'new_survey_submission',
      timestamp: new Date().toISOString(),
      role: answers.role,
      location: answers.q1,
    }),
  }).catch(() => {});
}

// ── Wishlist ideas ────────────────────────────────────────────────────────────

export async function getIdeas() {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .order('votes', { ascending: false });
  if (error) throw error;
  return data;
}

export async function submitIdea({ title, description, category }) {
  const { data, error } = await supabase
    .from('ideas')
    .insert([{ title, description: description || '', category }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function voteIdea(id, currentVotes, delta) {
  const { data, error } = await supabase
    .from('ideas')
    .update({ votes: Math.max(0, currentVotes + delta) })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteIdea(id) {
  const { error } = await supabase.from('ideas').delete().eq('id', id);
  if (error) throw error;
}

// ── Roadmap items ─────────────────────────────────────────────────────────────

export async function getRoadmapItems() {
  const { data, error } = await supabase
    .from('roadmap_items')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertRoadmapItem(item) {
  const { data, error } = await supabase
    .from('roadmap_items')
    .upsert([item])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRoadmapItem(id) {
  const { error } = await supabase.from('roadmap_items').delete().eq('id', id);
  if (error) throw error;
}
