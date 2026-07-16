# CCL Employee Health Monitoring Portal

A React/Vite frontend with an Express API for Twilio WhatsApp PME reminders. The application uses Supabase for authentication and data.

## Run locally

Prerequisites: Node.js 18+ and a Supabase project.

1. Copy `.env.example` to `.env.local`, then fill in the Supabase URL, its **publishable/anon** key, and the local API URL.
2. Copy `backend/.env.example` to `backend/.env`, then fill in the Twilio values.
3. Install and start the frontend:

   ```powershell
   npm install
   npm run dev
   ```

4. In another terminal, install and start the backend:

   ```powershell
   cd backend
   npm install
   npm start
   ```

## Deploy

Deploy the backend first to a service such as Render or Railway. Use `backend` as the service root directory, `npm install` as the build command, and `npm start` as the start command. Add these backend environment variables in the host dashboard:

```text
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_NUMBER
FRONTEND_URL
```

Then deploy the frontend to Vercel or Netlify with the repository root as the project directory, build command `npm run build`, and publish directory `dist`. Add these frontend environment variables in that host dashboard:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_API_BASE_URL
```

Set `VITE_API_BASE_URL` to the deployed backend URL, then set `FRONTEND_URL` to the final frontend URL. In Supabase Authentication, add the final frontend URL to the allowed Site URL / redirect URLs.

## Secret safety

- Never commit `.env`, `.env.local`, or `backend/.env`; they are ignored by `.gitignore`.
- Configure private values only in your deployment provider's environment-variable dashboard.
- The `VITE_SUPABASE_PUBLISHABLE_KEY` is safe to expose in a browser bundle by design. Never use a Supabase service-role key in frontend code.
- The current Supabase SQL policies permit every authenticated user to access broad health data. Before sharing beyond a demo, replace them with role- and employee-scoped Row Level Security policies.
- If any credential was previously shared or committed elsewhere, rotate it in Twilio/Supabase before deploying.
