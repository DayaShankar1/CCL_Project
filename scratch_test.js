import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLIC_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
  throw new Error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY before running this script.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function run() {
  try {
    const response = await fetch("http://localhost:5001/api/sms/send-reminder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: "+91 91223 44520",
        employeeName: "Savita Mahto"
      })
    });

    const data = await response.json();
    console.log("Backend Response:", data);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

run();
