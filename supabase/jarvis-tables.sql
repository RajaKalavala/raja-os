-- ═══════════════════════════════════════════════════════════
-- Jarvis Tables for RajaOS
-- Run this in Supabase SQL Editor
-- Requires: update_updated_at() trigger function (created in planner-tables.sql)
-- ═══════════════════════════════════════════════════════════

-- ─── 1. Memories ──────────────────────────────────────────

create table jarvis_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  memory_type text not null check (memory_type in ('insight', 'pattern', 'preference', 'decision', 'context')),
  category text not null check (category in ('work', 'health', 'finance', 'learning', 'habits', 'personal')),
  content text not null,
  source text check (source in ('chat', 'briefing', 'review', 'manual')),
  relevance_score float default 1.0,
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── 2. Briefings ─────────────────────────────────────────

create table jarvis_briefings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  briefing_date date not null,
  top_priority text,
  ai_insight text,
  raw_data jsonb,
  generated_at timestamptz not null default now(),
  unique (user_id, briefing_date)
);

-- ─── 3. Focus Sessions ───────────────────────────────────

create table jarvis_focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_description text not null,
  goal_id uuid references planner_goals(id) on delete set null,
  planned_duration_minutes int not null,
  actual_duration_minutes int,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  completion_notes text,
  blockers text,
  focus_rating int check (focus_rating >= 1 and focus_rating <= 5),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── 4. Habits ────────────────────────────────────────────

create table jarvis_habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null check (category in ('health', 'learning', 'work', 'personal')),
  frequency text not null default 'daily' check (frequency in ('daily', 'weekdays', 'weekly')),
  target_count int not null default 1,
  color text not null default '#10b981',
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── 5. Habit Logs ────────────────────────────────────────

create table jarvis_habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references jarvis_habits(id) on delete cascade not null,
  logged_date date not null,
  completed boolean not null default false,
  notes text,
  logged_at timestamptz not null default now(),
  unique (user_id, habit_id, logged_date)
);

-- ─── 6. Metrics Snapshots ─────────────────────────────────

create table jarvis_metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  snapshot_date date not null,
  week_number int,
  year int,
  work_score float,
  health_score float,
  learning_score float,
  side_project_score float,
  finance_score float,
  brand_score float,
  overall_score float,
  raw_data jsonb,
  created_at timestamptz not null default now()
);

-- ─── 7. Weekly Reviews ────────────────────────────────────

create table jarvis_weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  review_date date not null,
  week_start date not null,
  week_end date not null,
  wins text,
  challenges text,
  shipped text,
  missed text,
  habit_summary jsonb,
  goal_progress jsonb,
  ai_reflection text,
  linkedin_draft text,
  created_at timestamptz not null default now()
);

-- ─── 8. Captures ──────────────────────────────────────────

create table jarvis_captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  raw_input text not null,
  classified_type text check (classified_type in ('idea', 'task', 'goal', 'note', 'reminder')),
  classified_category text,
  ai_summary text,
  routed_to text check (routed_to in ('planner_ideas', 'planner_tasks', 'jarvis_memories', 'pending')),
  routed_id uuid,
  status text not null default 'pending' check (status in ('pending', 'routed', 'dismissed')),
  created_at timestamptz not null default now()
);

-- ─── 9. Chat Sessions ────────────────────────────────────

create table jarvis_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ─── 10. Nudges ───────────────────────────────────────────

create table jarvis_nudges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  nudge_type text not null,
  message text not null,
  action_label text,
  action_route text,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  snoozed_until timestamptz,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════

alter table jarvis_memories enable row level security;
alter table jarvis_briefings enable row level security;
alter table jarvis_focus_sessions enable row level security;
alter table jarvis_habits enable row level security;
alter table jarvis_habit_logs enable row level security;
alter table jarvis_metrics_snapshots enable row level security;
alter table jarvis_weekly_reviews enable row level security;
alter table jarvis_captures enable row level security;
alter table jarvis_chat_sessions enable row level security;
alter table jarvis_nudges enable row level security;

-- Users can only access their own data

create policy "Users can only access their own jarvis_memories"
  on jarvis_memories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_briefings"
  on jarvis_briefings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_focus_sessions"
  on jarvis_focus_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_habits"
  on jarvis_habits for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_habit_logs"
  on jarvis_habit_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_metrics_snapshots"
  on jarvis_metrics_snapshots for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_weekly_reviews"
  on jarvis_weekly_reviews for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_captures"
  on jarvis_captures for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_chat_sessions"
  on jarvis_chat_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can only access their own jarvis_nudges"
  on jarvis_nudges for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- Auto-update updated_at triggers
-- (uses existing update_updated_at() function from planner-tables.sql)
-- ═══════════════════════════════════════════════════════════

create trigger jarvis_memories_updated_at
  before update on jarvis_memories
  for each row execute function update_updated_at();

create trigger jarvis_habits_updated_at
  before update on jarvis_habits
  for each row execute function update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- Indexes for performance
-- ═══════════════════════════════════════════════════════════

-- jarvis_memories
create index idx_jarvis_memories_user on jarvis_memories(user_id);
create index idx_jarvis_memories_type on jarvis_memories(user_id, memory_type);
create index idx_jarvis_memories_category on jarvis_memories(user_id, category);

-- jarvis_briefings
create index idx_jarvis_briefings_user on jarvis_briefings(user_id);
create index idx_jarvis_briefings_date on jarvis_briefings(user_id, briefing_date);

-- jarvis_focus_sessions
create index idx_jarvis_focus_sessions_user on jarvis_focus_sessions(user_id);
create index idx_jarvis_focus_sessions_status on jarvis_focus_sessions(user_id, status);
create index idx_jarvis_focus_sessions_goal on jarvis_focus_sessions(goal_id);
create index idx_jarvis_focus_sessions_started on jarvis_focus_sessions(user_id, started_at);

-- jarvis_habits
create index idx_jarvis_habits_user on jarvis_habits(user_id);
create index idx_jarvis_habits_active on jarvis_habits(user_id, is_active);

-- jarvis_habit_logs
create index idx_jarvis_habit_logs_user on jarvis_habit_logs(user_id);
create index idx_jarvis_habit_logs_habit on jarvis_habit_logs(habit_id);
create index idx_jarvis_habit_logs_date on jarvis_habit_logs(user_id, logged_date);

-- jarvis_metrics_snapshots
create index idx_jarvis_metrics_user on jarvis_metrics_snapshots(user_id);
create index idx_jarvis_metrics_date on jarvis_metrics_snapshots(user_id, snapshot_date);
create index idx_jarvis_metrics_week on jarvis_metrics_snapshots(user_id, year, week_number);

-- jarvis_weekly_reviews
create index idx_jarvis_weekly_reviews_user on jarvis_weekly_reviews(user_id);
create index idx_jarvis_weekly_reviews_date on jarvis_weekly_reviews(user_id, review_date);

-- jarvis_captures
create index idx_jarvis_captures_user on jarvis_captures(user_id);
create index idx_jarvis_captures_status on jarvis_captures(user_id, status);

-- jarvis_chat_sessions
create index idx_jarvis_chat_user on jarvis_chat_sessions(user_id);
create index idx_jarvis_chat_created on jarvis_chat_sessions(user_id, created_at);

-- jarvis_nudges
create index idx_jarvis_nudges_user on jarvis_nudges(user_id);
create index idx_jarvis_nudges_unread on jarvis_nudges(user_id, is_read, is_dismissed);
