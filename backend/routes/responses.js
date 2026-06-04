const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/responses.json');

function load() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return []; }
}

function save(rows) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
}

// GET /api/responses
router.get('/', (_req, res) => {
  res.json(load());
});

// POST /api/responses
router.post('/', (req, res) => {
  const { answers } = req.body;
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'answers object required' });
  }

  const safeAnswers = {};
  for (let i = 1; i <= 9; i++) {
    const k = 'q' + i;
    safeAnswers[k] = typeof answers[k] === 'string' ? answers[k].slice(0, 1000) : '';
  }

  const rows = load();
  const entry = {
    id: 'R-' + String(rows.length + 1).padStart(3, '0'),
    submittedAt: new Date().toISOString(),
    answers: safeAnswers
  };
  rows.push(entry);
  save(rows);
  res.status(201).json(entry);
});

// DELETE /api/responses
router.delete('/', (_req, res) => {
  save([]);
  res.json({ message: 'All responses deleted' });
});

module.exports = router;
