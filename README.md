# Aadorp Digital Twin — Public Participation Platform

A bilingual (English / Dutch) web application for collecting resident input on the Aadorp digital twin project. Residents complete a survey, vote on community wishlist ideas, and follow project progress on a public roadmap. Admins manage all data through a protected dashboard.

---

## Project Structure

```
3DVerse_newpublicparticipation/
├── react-frontend/       # Vite + React SPA — deployed on Vercel
│   ├── src/
│   │   ├── pages/        # Intro, Survey, Dashboard, Admin, Wishlist
│   │   ├── components/   # Nav
│   │   ├── api/          # client.js — all Supabase calls in one place
│   │   └── lib/          # supabase.js — Supabase client initialisation
│   ├── public/           # Static assets (images)
│   ├── .env.example      # Required environment variables
│   └── vercel.json       # Vercel routing config
│
├── backend/              # Express REST API — for self-hosted deployments
│   ├── server.js         # Entry point
│   ├── db/
│   │   └── client.js     # ← swap THIS file to change database
│   ├── routes/
│   │   ├── responses.js  # /api/responses
│   │   ├── ideas.js      # /api/ideas
│   │   └── roadmap.js    # /api/roadmap
│   ├── migrations/       # Plain SQL schema files
│   └── .env.example      # Required environment variables
│
└── supabase/
    └── migrations/       # Supabase CLI migration files
```

---

## Application Pages

| Route | Description |
|---|---|
| `/` | Landing page with project intro and YouTube video |
| `/survey` | 9-question resident survey (bilingual) |
| `/dashboard` | Public roadmap showing project progress |
| `/admin` | Password-protected admin panel (login required) |

---

## Option A — Run with Supabase (current setup)

This is the default setup. The frontend talks directly to Supabase — no backend server needed.

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the migration files in order:
   - `backend/migrations/001_create_responses.sql`
   - `backend/migrations/002_create_ideas_and_roadmap.sql`
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**

### 2. Configure the frontend

```bash
cd react-frontend
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Run the frontend locally

```bash
cd react-frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Set up Admin authentication

1. In Supabase Dashboard → **Authentication → Users**, click **Add user**
2. Enter an email and password for the admin account
3. Use those credentials to log in at `/admin`

---

## Option B — Run with a Self-Hosted Backend

Use this option when migrating away from Supabase to your own database (PostgreSQL, MySQL, etc.).

### 1. Set up the database

Run the SQL files in `backend/migrations/` against your database in order:

```
001_create_responses.sql
002_create_ideas_and_roadmap.sql
```

> The SQL uses PostgreSQL syntax. For MySQL or other databases, minor adjustments may be needed (e.g. `UUID` type, `gen_random_uuid()`).

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

> **Service Role key vs Anon key:** The backend uses the Service Role key (bypasses Row Level Security). Find it in Supabase Dashboard → Project Settings → API → `service_role` secret.

### 3. Run the backend

```bash
cd backend
npm install
npm run dev        # development (auto-restarts on change)
npm start          # production
```

The API will be available at `http://localhost:3001`.

### 4. Migrate to a different database (PostgreSQL, MySQL, etc.)

The database layer is isolated to a single file: **`backend/db/client.js`**.

To switch away from Supabase:

1. Replace `backend/db/client.js` with your own database connection. Example using `pg` (PostgreSQL):

```js
// backend/db/client.js
import pg from 'pg';

export const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
```

2. Update each file in `backend/routes/` to use your new `db` client's query syntax instead of Supabase's `.from().select()` style.

3. Update `.env` to replace the Supabase variables with your database connection string:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

No other files need to change.

### 5. Point the frontend at the backend API

When self-hosting, the frontend needs to call your backend instead of Supabase. In `react-frontend/src/api/client.js`, replace the Supabase calls with `fetch()` calls to your backend endpoints:

```
GET    /api/responses          → getResponses()
POST   /api/responses          → submitResponse()
DELETE /api/responses          → deleteAllResponses()

GET    /api/ideas              → getIdeas()
POST   /api/ideas              → submitIdea()
PATCH  /api/ideas/:id/vote     → voteIdea()
DELETE /api/ideas/:id          → deleteIdea()

GET    /api/roadmap            → getRoadmapItems()
POST   /api/roadmap            → upsertRoadmapItem()
DELETE /api/roadmap/:id        → deleteRoadmapItem()
```

---

## Option C — Deploy to Vercel (hosted)

### Frontend

1. Push the repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Set **Root Directory** to `react-frontend`
4. Framework preset will auto-detect as **Vite**
5. Add environment variables:

| Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon public key |

6. Click **Deploy**

### After deploying — update Supabase

In Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

This is required for the Admin login to work in production.

### Backend (if self-hosting)

The backend can be deployed to any Node.js host:

| Platform | Notes |
|---|---|
| [Railway](https://railway.app) | Connect GitHub repo, set root to `backend/`, add env vars |
| [Render](https://render.com) | Create a Web Service, set root to `backend/`, add env vars |
| [Fly.io](https://fly.io) | `fly launch` from the `backend/` directory |

After deploying the backend, update `CORS_ORIGIN` in the backend `.env` to your Vercel frontend URL.

---

## Environment Variables Reference

### Frontend (`react-frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon (public) key |
| `VITE_NOTIFY_WEBHOOK_URL` | No | Webhook URL for new submission notifications |

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | Yes (if using Supabase) | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (if using Supabase) | Supabase service role key (secret) |
| `PORT` | No | Port to listen on (default: 3001) |
| `CORS_ORIGIN` | No | Allowed frontend origin(s), comma-separated (default: `http://localhost:5173`) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Backend API | Express.js (Node.js) |
| Hosting | Vercel (frontend) |
| Language | Bilingual — English and Dutch |

---

## Co-funded by

European Union (CIVIS) · 3DxVERSE project team · Aadorp, Overijssel, Netherlands
