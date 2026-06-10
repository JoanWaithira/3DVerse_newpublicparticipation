import { Router } from 'express';
import { db } from '../db/client.js';

const router = Router();

// GET /api/roadmap
router.get('/', async (_req, res) => {
  const { data, error } = await db
    .from('roadmap_items')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/roadmap  (create or update — send id to update)
router.post('/', async (req, res) => {
  const { id, title, description, status, sort_order } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const payload = { title, description: description || '', status: status || 'planned', sort_order: sort_order || 0 };
  if (id) payload.id = id;
  const { data, error } = await db
    .from('roadmap_items').upsert([payload]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// DELETE /api/roadmap/:id
router.delete('/:id', async (req, res) => {
  const { error } = await db.from('roadmap_items').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Item deleted' });
});

export default router;
