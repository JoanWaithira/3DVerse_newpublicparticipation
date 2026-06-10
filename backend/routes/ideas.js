import { Router } from 'express';
import { db } from '../db/client.js';

const router = Router();

// GET /api/ideas
router.get('/', async (_req, res) => {
  const { data, error } = await db
    .from('ideas')
    .select('*')
    .order('votes', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/ideas
router.post('/', async (req, res) => {
  const { title, description, category } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const { data, error } = await db
    .from('ideas')
    .insert([{ title, description: description || '', category: category || 'General' }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/ideas/:id/vote
router.patch('/:id/vote', async (req, res) => {
  const { delta } = req.body;
  const { data: current, error: fetchErr } = await db
    .from('ideas').select('votes').eq('id', req.params.id).single();
  if (fetchErr) return res.status(404).json({ error: 'Idea not found' });
  const newVotes = Math.max(0, (current.votes || 0) + (delta || 1));
  const { data, error } = await db
    .from('ideas').update({ votes: newVotes }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/ideas/:id
router.delete('/:id', async (req, res) => {
  const { error } = await db.from('ideas').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Idea deleted' });
});

export default router;
