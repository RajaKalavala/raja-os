-- ═══════════════════════════════════════════════════════════
-- Planner Tables for RajaOS
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Goals table
create table planner_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  category text not null default 'work',
  priority text not null default 'medium',
  status text not null default 'active',
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks table
create table planner_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_id uuid references planner_goals(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  category text not null default 'work',
  priority text not null default 'medium',
  status text not null default 'backlog',
  due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ideas table
create table planner_ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text,
  category text not null default 'personal',
  priority text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Row Level Security ─────────────────────────────────────

alter table planner_goals enable row level security;
alter table planner_tasks enable row level security;
alter table planner_ideas enable row level security;

-- Users can only access their own data
create policy "Users manage own goals" on planner_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own tasks" on planner_tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own ideas" on planner_ideas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Auto-update updated_at trigger ─────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger planner_goals_updated_at
  before update on planner_goals
  for each row execute function update_updated_at();

create trigger planner_tasks_updated_at
  before update on planner_tasks
  for each row execute function update_updated_at();

create trigger planner_ideas_updated_at
  before update on planner_ideas
  for each row execute function update_updated_at();

-- ─── Indexes for performance ────────────────────────────────

create index idx_planner_goals_user on planner_goals(user_id);
create index idx_planner_tasks_user on planner_tasks(user_id);
create index idx_planner_tasks_goal on planner_tasks(goal_id);
create index idx_planner_ideas_user on planner_ideas(user_id);
