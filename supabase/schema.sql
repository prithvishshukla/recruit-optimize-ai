-- TalentForge AI Production Database Schema Migration
-- Includes tables, triggers, indices, and Row Level Security (RLS) policies

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (public.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Backwards compatibility profiles table mapping to users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;
alter table public.profiles enable row level security;

-- Policies for public.users
create policy "Users can view their own record" on public.users for select using (auth.uid() = id);
create policy "Users can update their own record" on public.users for update using (auth.uid() = id);
create policy "Admins can view all records" on public.users for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Policies for public.profiles (backwards compatibility)
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 2. Subscriptions Table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade unique not null,
  plan_type text not null default 'free' check (plan_type in ('free', 'premium')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled')),
  current_period_end timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

-- Policies
create policy "Users can view their own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Admins can view all subscriptions" on public.subscriptions for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 3. Resumes Table
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  file_name text not null,
  file_size integer not null,
  cloudinary_url text not null,
  cloudinary_public_id text not null,
  extracted_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resumes enable row level security;

-- Policies
create policy "Users can perform all actions on their own resumes" on public.resumes for all using (auth.uid() = user_id);
create policy "Admins can view all resumes" on public.resumes for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 4. Analysis Reports Table
create table if not exists public.analysis_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  resume_id uuid references public.resumes(id) on delete cascade not null,
  job_title text not null,
  job_description text not null,
  ats_score integer not null,
  jd_match integer not null,
  resume_health integer not null,
  keyword_coverage integer not null,
  analysis_result jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.analysis_reports enable row level security;

-- Policies
create policy "Users can perform all actions on their own analysis reports" on public.analysis_reports for all using (auth.uid() = user_id);
create policy "Admins can view all analysis reports" on public.analysis_reports for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 5. Keyword Analysis Table (Required Table)
create table if not exists public.keyword_analysis (
  id uuid default gen_random_uuid() primary key,
  analysis_id uuid references public.analysis_reports(id) on delete cascade not null,
  keyword text not null,
  type text not null check (type in ('found', 'missing')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.keyword_analysis enable row level security;

-- Policies
create policy "Users can view their own keyword analyses" on public.keyword_analysis for select using (
  exists (
    select 1 from public.analysis_reports
    where id = analysis_id and user_id = auth.uid()
  )
);
create policy "Users can insert keyword analyses" on public.keyword_analysis for insert with check (
  exists (
    select 1 from public.analysis_reports
    where id = analysis_id and user_id = auth.uid()
  )
);
create policy "Admins can view all keyword analyses" on public.keyword_analysis for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 6. Score History Table (Required Table)
create table if not exists public.score_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  ats_score integer not null,
  jd_match integer not null,
  resume_health integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.score_history enable row level security;

-- Policies
create policy "Users can view their own score history" on public.score_history for select using (auth.uid() = user_id);
create policy "Users can insert score history" on public.score_history for insert with check (auth.uid() = user_id);
create policy "Admins can view all score histories" on public.score_history for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 7. Resume Versions Table
create table if not exists public.resume_versions (
  id uuid default gen_random_uuid() primary key,
  resume_id uuid references public.resumes(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  version_number integer not null,
  ats_score integer not null,
  jd_match integer not null,
  resume_health integer not null,
  improvement_summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.resume_versions enable row level security;

-- Policies
create policy "Users can view their own resume versions" on public.resume_versions for select using (auth.uid() = user_id);
create policy "Users can create their own resume versions" on public.resume_versions for insert with check (auth.uid() = user_id);
create policy "Admins can view all resume versions" on public.resume_versions for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 8. Payments Table
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  razorpay_payment_id text not null,
  razorpay_order_id text,
  amount integer not null,
  plan text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payments enable row level security;

-- Policies
create policy "Users can view their own payments" on public.payments for select using (auth.uid() = user_id);
create policy "Users can record payments" on public.payments for insert with check (auth.uid() = user_id);
create policy "Admins can view all payments" on public.payments for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- 9. Activity Logs Table
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  action text not null,
  details text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.activity_logs enable row level security;

-- Policies
create policy "Users can view their own activity logs" on public.activity_logs for select using (auth.uid() = user_id);
create policy "Users can create their own activity logs" on public.activity_logs for insert with check (auth.uid() = user_id);
create policy "Admins can view all activity logs" on public.activity_logs for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Creating indices for query optimization
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_reports_user_id on public.analysis_reports(user_id);
create index if not exists idx_reports_resume_id on public.analysis_reports(resume_id);
create index if not exists idx_keyword_analysis_id on public.keyword_analysis(analysis_id);
create index if not exists idx_score_history_user_id on public.score_history(user_id);
create index if not exists idx_versions_resume_id on public.resume_versions(resume_id);
create index if not exists idx_payments_user_id on public.payments(user_id);

-- Triggers for automatic user setups on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insert into public.users
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'
  );

  -- Insert into public.profiles
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user'
  );

  -- Insert default free subscription
  insert into public.subscriptions (user_id, plan_type, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
