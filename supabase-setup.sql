-- ================================================================
--  KOTHAY GELO? — Supabase Database Setup
--  Run this entire file in: Supabase → SQL Editor → Run
-- ================================================================

-- 0. USERS (for login/registration)
create table if not exists users (
  id            bigint generated always as identity primary key,
  user_id       text unique not null,
  username      text unique not null,
  password_hash text        not null,
  display_name  text,
  created_at    timestamptz default now()
);

-- 1. EXPENSES
create table if not exists expenses (
  id         bigint generated always as identity primary key,
  user_id    text        not null,
  amount     numeric     not null,
  category   text        not null default 'Other',
  note       text,
  method     text        default 'Cash',
  date       timestamptz default now(),
  created_at timestamptz default now()
);

-- 2. GOALS
create table if not exists goals (
  id         bigint generated always as identity primary key,
  user_id    text    not null,
  title      text    not null,
  sub        text,
  emoji      text    default '🎯',
  target     numeric not null default 10000,
  saved      numeric default 0,
  color      text    default '#6c5ce7',
  type       text    default 'saving',
  is_default boolean default false,
  created_at timestamptz default now()
);

-- 3. SETTINGS
create table if not exists settings (
  id             bigint generated always as identity primary key,
  user_id        text unique not null,
  daily_limit    numeric default 1000,
  monthly_budget numeric default 15000,
  food_budget    numeric default 5000,
  fun_budget     numeric default 2000,
  user_name      text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- 4. LOANS
create table if not exists loans (
  id          bigint generated always as identity primary key,
  user_id     text    not null,
  name        text    not null,
  amount      numeric not null,
  note        text,
  type        text    not null default 'owed', -- 'owed' = they owe me, 'owe' = I owe them
  settled     boolean default false,
  due_date    timestamptz,
  settled_at  timestamptz,
  date        timestamptz default now(),
  created_at  timestamptz default now()
);

-- 5. ROW LEVEL SECURITY
alter table users    enable row level security;
alter table expenses enable row level security;
alter table goals    enable row level security;
alter table settings enable row level security;
alter table loans    enable row level security;

-- 6. POLICIES (allow all — auth is handled app-side)
create policy "allow_all_users"    on users    for all using (true) with check (true);
create policy "allow_all_expenses" on expenses for all using (true) with check (true);
create policy "allow_all_goals"    on goals    for all using (true) with check (true);
create policy "allow_all_settings" on settings for all using (true) with check (true);
create policy "allow_all_loans"    on loans    for all using (true) with check (true);

-- 7. INDEXES
create index if not exists idx_users_username    on users(username);
create index if not exists idx_expenses_user     on expenses(user_id);
create index if not exists idx_expenses_date     on expenses(date desc);
create index if not exists idx_goals_user        on goals(user_id);
create index if not exists idx_loans_user        on loans(user_id);
create index if not exists idx_loans_type        on loans(type);
create index if not exists idx_loans_settled     on loans(settled);

-- ✅ All 5 tables ready!
-- NOTE: This app uses simple password hashing (not bcrypt).
--       For production, consider upgrading to Supabase Auth or
--       a server-side bcrypt implementation.
