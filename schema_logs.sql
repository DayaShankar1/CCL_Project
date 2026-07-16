-- SQL Script to set up the 'reminder_logs' and 'schedule_logs' tables in Supabase
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create reminder_logs table
create table if not exists public.reminder_logs (
  id uuid default gen_random_uuid() primary key,
  "employeeId" text not null,
  "employeeName" text not null,
  type text not null,
  "sentAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null,
  constraint fk_employee_reminders foreign key ("employeeId") references employees("employeeId") on delete cascade
);

-- Enable Row Level Security (RLS) on reminder_logs
alter table public.reminder_logs enable row level security;

-- Create policy to allow full access for authenticated users to reminder_logs
drop policy if exists "Allow authenticated users full access to reminder_logs" on public.reminder_logs;
create policy "Allow authenticated users full access to reminder_logs"
  on public.reminder_logs for all
  to authenticated
  using (true)
  with check (true);

-- 2. Create schedule_logs table
create table if not exists public.schedule_logs (
  id uuid default gen_random_uuid() primary key,
  "employeeId" text not null,
  "employeeName" text not null,
  doctor text not null,
  "hospitalWing" text not null,
  date date not null,
  "timeSlot" text not null,
  remarks text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint fk_employee_schedules foreign key ("employeeId") references employees("employeeId") on delete cascade
);

-- Enable Row Level Security (RLS) on schedule_logs
alter table public.schedule_logs enable row level security;

-- Create policy to allow full access for authenticated users to schedule_logs
drop policy if exists "Allow authenticated users full access to schedule_logs" on public.schedule_logs;
create policy "Allow authenticated users full access to schedule_logs"
  on public.schedule_logs for all
  to authenticated
  using (true)
  with check (true);
