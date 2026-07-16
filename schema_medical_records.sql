-- SQL Script to set up the 'medical_records' table in Supabase
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

create table if not exists medical_records (
  id uuid default gen_random_uuid() primary key,
  "employeeId" text not null,
  "examinationDate" date not null,
  "medicalOfficer" text,

  -- Patient Vitals
  "systolicBP" integer,
  "diastolicBP" integer,
  "pulseRate" integer,
  "respiratoryRate" integer,
  "temperature" numeric,
  "weight" numeric,
  "height" numeric,
  "spo2" integer,

  -- Spirometry
  "fvc" numeric,
  "fev1" numeric,
  "fev1Ratio" numeric,
  "spirometryOpinion" text,

  -- Radiology
  "iloClassification" text,
  "radiologyDiagnosis" text,
  "radiologyNotes" text,

  -- Risk Assessment
  "riskScore" integer default 0,
  "riskCategory" text default 'Low',

  -- Board Decision
  "fitnessStatus" text default 'Fit',
  "restrictions" text,

  -- Remarks
  "examinerRemarks" text,

  -- Audit
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Foreign Key Constraint referencing the employees table
  constraint fk_employee foreign key ("employeeId") references employees("employeeId") on delete cascade
);

-- Enable Row Level Security (RLS)
alter table medical_records enable row level security;

-- Create policy to allow all authenticated users to select/insert/update/delete
create policy "Allow authenticated users full access to medical records"
  on medical_records for all
  to authenticated
  using (true)
  with check (true);
