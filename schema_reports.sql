-- SQL Script to set up the 'reports' table and storage policies in Supabase
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create the reports table if it doesn't exist
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  "employeeId" text not null,
  "fileName" text not null,
  "fileType" text not null,
  "fileUrl" text not null,
  "uploadedBy" text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint fk_employee foreign key ("employeeId") references employees("employeeId") on delete cascade
);

-- Enable Row Level Security (RLS) on public.reports
alter table public.reports enable row level security;

-- Create policy to allow all authenticated users full access to reports
drop policy if exists "Allow authenticated users full access to reports" on public.reports;
create policy "Allow authenticated users full access to reports"
  on public.reports for all
  to authenticated
  using (true)
  with check (true);

-- 2. Ensure the storage bucket 'medical-reports' exists
insert into storage.buckets (id, name, public)
values ('medical-reports', 'medical-reports', true)
on conflict (id) do nothing;

-- Enable RLS on storage objects
alter table storage.objects enable row level security;

-- Create policies for storage.objects on medical-reports bucket
drop policy if exists "Allow authenticated users to upload medical reports" on storage.objects;
create policy "Allow authenticated users to upload medical reports"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'medical-reports');

drop policy if exists "Allow authenticated users to read medical reports" on storage.objects;
create policy "Allow authenticated users to read medical reports"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'medical-reports');

drop policy if exists "Allow authenticated users to update medical reports" on storage.objects;
create policy "Allow authenticated users to update medical reports"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'medical-reports')
  with check (bucket_id = 'medical-reports');

drop policy if exists "Allow authenticated users to delete medical reports" on storage.objects;
create policy "Allow authenticated users to delete medical reports"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'medical-reports');
