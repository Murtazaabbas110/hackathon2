# ScopeFlow

ScopeFlow is an AI-powered project planning and execution app. You describe a client brief in plain language, and ScopeFlow analyzes it, generates a structured backlog of work items, and helps you execute it — either as a Kanban flow or through Agile sprints.

## What's inside

- **Sign up / sign in** — cookie-based session auth backed by a Supabase `users` table. All routes are protected per-user.
- **Project creation** — enter a client message and let Groq analyze it into summary, objectives, target users, requirements, ambiguities, risks, assumptions, and dependencies — with a deterministic complexity and readiness score.
- **Project intelligence** — a tabbed workspace (Overview / Requirements / Ambiguities / Risks / Assumptions / Dependencies / Work Items) that surfaces the AI analysis.
- **Work item generation** — generate 8–20 prioritized work items (epic, title, description, priority, acceptance criteria, dependencies) from the analysis in one call.
- **Execution boards** — choose a methodology per project:
  - **Kanban** — move work items through Backlog → To Do → In Progress → Review → Done.
  - **Agile** — create sprints, pull items from the product backlog, and move them through To Do → In Progress → Done.
  - Work items are moved with simple arrow controls, persisted to Supabase, and kept in sync with optimistic updates.
- **Progress tracking** — live progress meters on the project workspace and a dashboard with stats (total, active, average readiness, overall progress) and per-project progress bars.
- **Reusable Code Gigs** — self-contained modules for Supabase client setup, cookie auth, Groq JSON calls, work item generation, and progress/complexity/readiness calculators.

## Tech stack

- **Next.js 14** (App Router) · **React 18** · **Tailwind CSS 3**
- **Supabase** (Postgres, client SDK) — auth, projects, work items, sprints
- **Groq** (LLM API) — project analysis and work item generation
- **lucide-react** — icons

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` (or `.env`) and fill in your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

### 3. Set up the database

Create the tables defined in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase project. That file is the source of truth for the schema (`projects`, `work_items`, `sprints`, `users`) and matches the queries used across the app.

> If you see `Could not find the table 'public.projects' in the schema cache`, the schema has not been applied yet.

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:3000, create an account, and start a project.

## Useful commands

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Run the production build     |
| `npm run lint`  | Run ESLint                   |

## Project structure

```
app/                  Next.js routes (pages + API routes)
components/           UI components (project boards, cards, meters)
code-gigs/            Reusable, self-contained feature modules
supabase/schema.sql   Database schema (source of truth)
```
