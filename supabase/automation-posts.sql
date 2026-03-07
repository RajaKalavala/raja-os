-- ═══════════════════════════════════════════════════════════
-- Automation Posts Table for RajaOS
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

create table automation_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  platform text not null default 'linkedin',
  content text not null,
  topic text,
  status text not null default 'draft',
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table automation_posts enable row level security;

create policy "Users manage own posts" on automation_posts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-update trigger (reuses the function from planner-tables.sql)
create trigger automation_posts_updated_at
  before update on automation_posts
  for each row execute function update_updated_at();

-- Index
create index idx_automation_posts_user on automation_posts(user_id);
create index idx_automation_posts_platform on automation_posts(platform, status);
