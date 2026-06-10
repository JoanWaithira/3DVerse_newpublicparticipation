import { Router } from 'express';
import { db } from '../db/client.js';

const router = Router();

// GET /api/responses
router.get('/', async (_req, res) => {
  const { data, error } = await db
    .from('responses')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/responses
router.post('/', async (req, res) => {
  const { role, q1, q2, q3, q4, q5, q6, q7, q8, q9 } = req.body;
  const { data, error } = await db
    .from('responses')
    .insert([{ role: role || '', q1: q1 || '', q2: q2 || '', q3: q3 || '',
               q4: q4 || '', q5: q5 || '', q6: q6 || '', q7: q7 || '',
               q8: q8 || '', q9: q9 || '' }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/responses
router.delete('/', async (_req, res) => {
  const { error } = await db.from('responses').delete().not('id', 'is', null);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'All responses deleted' });
});

export default router;
