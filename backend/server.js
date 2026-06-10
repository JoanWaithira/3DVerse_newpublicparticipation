import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import responsesRouter from './routes/responses.js';
import ideasRouter    from './routes/ideas.js';
import roadmapRouter  from './routes/roadmap.js';

const app  = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/responses', responsesRouter);
app.use('/api/ideas',     ideasRouter);
app.use('/api/roadmap',   roadmapRouter);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.listen(PORT, () => console.log(`Aadorp API running on http://localhost:${PORT}`));
