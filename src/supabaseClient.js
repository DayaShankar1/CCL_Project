import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
  );
}

// The Supabase publishable/anon key is intentionally available to the browser.
// Protect data with Supabase Row Level Security policies; never use a service-role key here.
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
