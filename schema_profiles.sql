-- SQL Script to set up the 'profiles' table in Supabase
-- Paste and run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text default 'Doctor' check (role in ('Admin', 'Doctor', 'Medical Staff')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policy to allow all authenticated users full select/update access
create policy "Allow authenticated users full access to profiles"
  on public.profiles for all
  to authenticated
  using (true)
  with check (true);

-- Trigger to automatically insert profile on auth.users sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'fullName', 'Hospital Staff'),
    coalesce(new.raw_user_meta_data->>'role', 'Doctor')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
