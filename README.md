# ScopeFlow

AI-assisted project planning and execution for messy client requirements.

ScopeFlow takes an unstructured client brief (email, document, chat transcript), analyses it with Gemini, and turns it into a structured project workspace backed by Supabase:

- Project intelligence (summary, objectives, risks, ambiguities, dependencies).
- Deterministic complexity and readiness scores.
- AI-generated work items.
- Kanban and Agile execution boards with drag & drop.
- Real authentication using Supabase Auth.

This repository is a hackathon‑grade MVP built on Next.js, Tailwind CSS, dnd-kit, lucide-react, Supabase, and the Gemini API.

# ScopeFlow — AI project intelligence and execution (Hackathon MVP)

ScopeFlow converts unstructured client messages into structured project intelligence, then into executable work items and a Kanban/Agile workspace.

This repository contains the Next.js demo app used for the hackathon MVP.

Quick overview:
- Next.js (app router) frontend
- TailwindCSS + shadcn/ui for styling
- Supabase for persistence and Auth
- Gemini (server-side) for AI analysis
- dnd-kit for Kanban drag-and-drop

Quickstart (development)
1. Install dependencies

```bash
npm install
```

2. Prepare environment variables (create `.env.local`)

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — (only needed for server operations; do not commit)
- `GEMINI_API_KEY` — Gemini server API key

Example `.env.local` (do not commit secrets):

```ini
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key-if-needed
GEMINI_API_KEY=your_gemini_key
```

3. Database migrations (Supabase CLI recommended)

This repo includes a non-destructive SQL migration at:

`supabase/migrations/20260812000000_create_scopeflow_schema.sql`

To apply migrations to a remote Supabase project (recommended):

```bash
# Install Supabase CLI (if missing)
# macOS / Linux (recommended): see https://supabase.com/docs/guides/cli
npm install -g supabase

# Initialize local supabase config (creates ./supabase)
supabase init

# Link to your remote project (you must provide the project ref)
supabase link --project-ref <YOUR_PROJECT_REF>

# Push pending migrations to the remote DB
supabase db push
```

If you cannot run the CLI in this environment, the migration SQL is already committed under `supabase/migrations/` — you can run `supabase db push` locally once you have the CLI and the project ref.

4. Run the app

```bash
npm run dev
```

Open http://localhost:3000 and sign up / sign in.

Notes and developer guidance
- The repo uses a small `code-gigs/` collection of reusable utilities (e.g., `supabase-client`).
- The `supabase/schema.sql` file contains the canonical schema and the migration mirrors it using non-destructive `CREATE IF NOT EXISTS` statements.
- Auth is Supabase email/password; server-side API routes should validate `Authorization: Bearer <token>` using the Supabase server client.

Contributing
- Keep changes minimal and focused on demonstrating the product flow: Create project → Analyze (Gemini) → Generate work items → Select methodology → Execute.

Known limitations
- This is a hackathon MVP, optimized for a demo rather than production readiness.
- Secrets and service-role keys must never be committed.

If you need help running the Supabase CLI or linking to your project, provide the `PROJECT_REF` and I can generate exact commands and any missing migration files.

Client components that call these APIs (e.g. `projects/[id]/page.js`, `projects/new/page.js`) now use `authFetch` so the bearer token is always attached.

---

## Database Schema & Migrations

ScopeFlow uses a small Postgres schema under the `public` schema.

The logical schema lives in `supabase/schema.sql` and the generated migration lives in `supabase/migrations/20260101000000_create_scopeflow_schema.sql`.

### Tables

- `projects`
  - `id uuid primary key default gen_random_uuid()`
  - `user_id text not null` – Supabase Auth user id.
  - `name text not null`
  - `client_message text not null`
  - `analysis jsonb` – Gemini project analysis payload (summary, requirements, risks, etc.) with extra `complexity` and `readiness` fields.
  - `methodology text` – `KANBAN` or `AGILE`.
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- `work_items`
  - `id uuid primary key default gen_random_uuid()`
  - `project_id uuid not null references projects(id) on delete cascade`
  - `epic text`
  - `title text not null`
  - `description text`
  - `priority text`
  - `status text not null default 'BACKLOG'` – global lifecycle status (`BACKLOG`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`).
  - `sprint_id uuid references sprints(id) on delete set null` – optional sprint association.
  - `sprint_status text` – per‑sprint execution status (`TODO`, `IN_PROGRESS`, `DONE`).
  - `acceptance_criteria text` – JSON‑encoded array of strings.
  - `dependencies jsonb not null default '[]'::jsonb`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- `sprints`
  - `id uuid primary key default gen_random_uuid()`
  - `project_id uuid not null references projects(id) on delete cascade`
  - `name text not null`
  - `goal text`
  - `status text not null default 'ACTIVE'` – `ACTIVE`, `ARCHIVED`, `DONE`.
  - `start_date date`
  - `end_date date`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`

### Non-destructive migration

The migration file `supabase/migrations/20260101000000_create_scopeflow_schema.sql` is intentionally **non-destructive**:

- Uses `create schema if not exists public;` and `set search_path to public;`.
- Uses `create table if not exists ...` for all tables.
- Uses `create index if not exists ...` for indexes.
- Does **not** contain any `drop table`, `drop column`, or destructive `alter table` statements.

This makes it safe to run repeatedly or on top of an existing database, as long as the existing schema is compatible.

You can treat `supabase/schema.sql` as the logical source of truth and regenerate migrations from it as the schema evolves.

---

## UI Overview & Enhancements

### Landing / Auth

- Landing page (`app/page.js`)
  - Responsive, mobile-first layout with gradient background and grid overlay.
  - Clear CTA buttons for **Get started** (sign-up) and **Sign in**.
  - Analog meters show demo readiness and perceived complexity.
- Login (`app/login/page.js`)
  - Supabase email/password login with lucide icons and Tailwind styling.
  - Inline validation, disabled state, and friendly error text.
  - Link to sign-up page.
- Signup (`app/signup/page.js`)
  - Email/password registration form with confirm password validation.
  - Shows a success hint when email confirmation is required.
  - Redirects immediately to dashboard when Supabase returns a session.

### Dashboard (`app/dashboard/page.js`)

- Auth-guarded via `AuthGuard`.
- Loads projects for the authenticated user directly from Supabase.
- Displays:
  - Analog meters for project capacity, analyzed share, and average readiness.
  - Summary cards for total projects, analyzed projects, and average readiness.
  - A **readiness trend chart** using Recharts (AreaChart) showing readiness per project.
  - Project list with readiness badges and analysis status.

### Project Intelligence (`app/projects/[id]/page.js`)

- Auth-guarded.
- Shows:
  - Client message panel.
  - Analysis status panel with buttons to run / re-run Gemini analysis and generate work items.
  - `IntelligenceOverview` card with readiness meter, complexity & risk badges, objectives, and target users.
  - Dedicated sections for requirements, ambiguities, risks, assumptions, dependencies via `IntelligenceSectionList`.
  - Work item preview list extracted from analysis.
  - Methodology selector (Kanban vs Agile).

### Execution boards

- **Kanban** (`components/project/KanbanBoard.js`)
  - Uses dnd-kit for drag-and-drop across `BACKLOG`, `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE` columns.
  - Column styling with Tailwind and analog meter for overall progress.
  - Persists status updates via `/api/projects/work-items/status` using optimistic UI updates.
- **Agile** (`components/project/AgileBoard.js`)
  - Product backlog and current sprint view.
  - dnd-kit drag-and-drop for sprint status (`TODO`, `IN_PROGRESS`, `DONE`).
  - Sprint creation and work item membership stored in Supabase.
  - Analog meter for sprint progress.

Kanban and Agile UI have been tuned for responsiveness, spacing, and clear visual hierarchy.

---

## Environment Variables

Create `.env.local` (or `.env`) in the project root with at least:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Gemini
GEMINI_API_KEY=your_gemini_api_key
```

Optional (for running Supabase CLI locally):

```bash
SUPABASE_ACCESS_TOKEN=your_pat_for_supabase_cli
SUPABASE_DB_PASSWORD=your_local_db_password
```

Do **not** commit real secrets. The `.env` and `.env.local` files are already git‑ignored.

---

## Local Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create `.env.local` with the values described above.

3. **Set up Supabase project**

   - Create a new Supabase project in the dashboard.
   - Copy the **Project URL** and **anon public key** into `.env.local`.

4. **Initialize the database schema**

   You can either:

   - Run the migration file directly in the Supabase SQL editor:

     ```sql
     -- Paste the contents of supabase/migrations/20260101000000_create_scopeflow_schema.sql
     ```

   - Or use the Supabase CLI (recommended for local dev):

     ```bash
     # 1. Initialize Supabase locally (once per repo)
     supabase init

     # 2. Link to your remote project (follow the prompts)
     supabase link --project-ref YOUR_PROJECT_REF

     # 3. Push the local database schema and migrations
     supabase db push
     ```

   The migration is non-destructive, so it is safe to apply to an existing database that already has compatible tables.

5. **Run the app**

   ```bash
   npm run dev
   ```

   Then open http://localhost:3000.

---

## Applying Migrations Manually

If you want finer control over migrations, you can:

1. Inspect `supabase/schema.sql` and `supabase/migrations/20260101000000_create_scopeflow_schema.sql`.
2. Use the Supabase CLI to create additional migrations that evolve the schema **without** destructive DDL:

   ```bash
   # After editing supabase/schema.sql
   supabase migration new add_new_scopeflow_field
   # Copy the relevant, non-destructive DDL from schema.sql into the new migration.
   supabase db push
   ```

Follow these rules when editing migrations:

- Prefer `create table if not exists`, `alter table ... add column if not exists`, and `create index if not exists`.
- Avoid `drop table`, `drop column`, or `alter table ... type` in shared environments.

---

## Known Limitations & Future Enhancements

- **Multi-tenant security**
  - API routes authenticate using bearer tokens, but authorization is mostly enforced by associating `projects.user_id` with the authenticated user. Some secondary queries (e.g. sprint/item updates) could be further tightened with row-level security (RLS) and Postgres policies.
  - Recommended: enable RLS on all tables and add policies matching `auth.uid() = user_id`.
- **Email flows**
  - The default Supabase email confirmation flow is assumed. You may want to customize email templates and enable/disable confirmations depending on your environment.
- **Error handling and observability**
  - Errors are surfaced in the UI but not centrally logged. For production, integrate with logging/monitoring (e.g. Sentry).
- **AI costs and rate limiting**
  - Gemini calls are not rate-limited here. In production, add server-side rate limiting and request deduplication.
- **Schema evolution**
  - Only a single generated migration is included. As the product evolves, follow the non-destructive migration pattern and keep `schema.sql` as the source of truth.

---

## Testing the App End-to-End

After setup and migration:

```bash
# Install dependencies
npm install

# (Optional) Initialize and push Supabase schema via CLI
supabase init
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# Run the app
npm run dev
```

Then:

1. Visit `http://localhost:3000`.
2. Click **Get started free** and create an account.
3. Create a new project from a real or sample client brief.
4. Run analysis and generate work items.
5. Choose Kanban or Agile and drag items across the board.

You now have a fully authenticated, Supabase-backed ScopeFlow workspace.