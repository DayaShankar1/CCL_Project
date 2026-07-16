-- SQL Script to set up the 'employees' table in Supabase
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

create table if not exists employees (
  id uuid default gen_random_uuid() primary key,
  "employeeId" text unique not null,
  name text not null,
  age integer,
  gender text,
  dob date,
  "bloodGroup" text,
  "contactNo" text,
  department text,
  designation text,
  "totalServiceYears" integer default 0,
  "dateOfJoining" date,
  "dustExposureLevel" text,
  "workCategory" text,
  "mineName" text,
  "pmeStatus" text default 'Fit',
  "riskScore" integer default 0,
  "riskCategory" text default 'Low',
  "complianceRating" numeric default 5.0,
  "lastPmeDate" date,
  "nextPmeDueDate" date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table employees enable row level security;

-- Create policy to allow all authenticated users to select/insert/update/delete
create policy "Allow authenticated users full access"
  on employees for all
  to authenticated
  using (true)
  with check (true);
