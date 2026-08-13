create extension if not exists pgcrypto;
create schema if not exists public;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  email text unique not null,
  password text not null
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  client_message text not null,
  analysis jsonb,
  methodology text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_methodology_check check (methodology is null or methodology in ('KANBAN', 'AGILE'))
);

create table if not exists sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  goal text,
  status text not null default 'ACTIVE',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sprints_status_check check (status in ('ACTIVE', 'ARCHIVED', 'DONE'))
);

create table if not exists work_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  epic text,
  title text not null,
  description text,
  priority text,
  status text not null default 'BACKLOG',
  sprint_id uuid references sprints(id) on delete set null,
  sprint_status text,
  acceptance_criteria text,
  dependencies jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_items_status_check check (status in ('BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE')),
  constraint work_items_sprint_status_check check (
    sprint_status is null or sprint_status in ('TODO', 'IN_PROGRESS', 'DONE')
  )
);

create index if not exists projects_user_id_idx on projects(user_id);
create index if not exists sprints_project_id_idx on sprints(project_id);
create index if not exists work_items_project_id_idx on work_items(project_id);
create index if not exists work_items_sprint_id_idx on work_items(sprint_id);