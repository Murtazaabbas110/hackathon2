# ScopeFlow (Phase 1–4)

Runnable MVP-in-progress for ScopeFlow — an AI-powered project planning and execution app.

Phase 1 delivered:

- Landing page explaining the core transformation.
- Demo authentication using `localStorage` (`scopeflow_user`).
- Auth-guarded dashboard with metrics and a Supabase-backed project list.
- New project flow from client message, persisting to Supabase.
- Server-side Gemini project analysis with deterministic complexity/readiness.
- Project workspace shell showing client message and analysis status.
- Reusable Code Gigs modules for Supabase, auth, and Gemini JSON client.

Phase 2 adds:

- Deterministic complexity and readiness calculators as standalone Code Gigs.
- A richer Project Intelligence workspace on the project page with:
  - Overview panel (summary, objectives, target users, complexity, readiness).
  - Requirement, ambiguity, risk, assumption, and dependency sections with counts.
  - Inline evidence (source excerpts) where provided by the AI analysis JSON.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Environment variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Database schema (Supabase)

Create tables roughly equivalent to:

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  client_message text not null,
  analysis jsonb,
  methodology text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table work_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  epic text,
  title text,
  description text,
  priority text,
  status text,
  acceptance_criteria text,
  dependencies jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  name text,
  goal text,
  status text,
  start_date date,
  end_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

This schema is intentionally simple and can be evolved in later phases.

## Phase 3 – AI-Powered Work Item Generation

Phase 3 adds:

- A dedicated Gemini-backed work item generator as a reusable Code Gig.
- `/api/projects/work-items` API route that:
  - Loads validated project analysis.
  - Calls Gemini once to generate 8–20 work items.
  - Normalizes and validates the response.
  - Stores work items in the `work_items` table (replacing any previous items for that project).
- Project workspace UI updates to:
  - Trigger work item generation from the analysis.
  - Display the list of generated work items under the intelligence overview.
  - Show clear loading and error states for work item generation.

## Phase 4 – Execution Methodology Selection

Phase 4 adds:

- A polished execution methodology selector on the project workspace.
- Deterministic choice between `KANBAN` and `AGILE` (no additional AI calls).
- `/api/projects/methodology` API route to persist the `methodology` field on the `projects` table.
- Client-side validation to only allow `KANBAN` or `AGILE`.
- Loading, error, and success states when saving the methodology.
- Methodology selection is only available once work items exist for the project.
