# CCL Employee Health Monitoring Portal

A comprehensive, full-stack occupational healthcare management portal built for **Central Coalfields Limited (CCL) Gandhinagar Hospital**. The application streamlines employee medical examinations, automates Periodic Medical Examination (PME) tracking, performs medical risk assessment for underground/surface mine workers, integrates Gemini AI for clinical insights, sends WhatsApp notifications via Twilio, and provides role-based access for hospital administrators, doctors, and medical staff.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Local Setup & Running](#local-setup--running)
- [API Endpoints](#api-endpoints)
- [Deployment Guide](#deployment-guide)
- [Security & Production Guidelines](#security--production-guidelines)

---

## 🌟 Overview

Coal mine workers are exposed to hazardous working conditions, including respirable dust, silica, and heavy physical strain. Regular **Periodic Medical Examinations (PME)** are mandated by mining regulations to detect occupational health hazards early (such as Pneumoconiosis, silicosis, and respiratory impairment). 

The **CCL Employee Health Monitoring Portal** digitizes and automates the complete medical workflow for CCL Gandhinagar Hospital:
- Digital **Form O** clinical examination records (vitals, spirometry, ILO chest radiography).
- Automated medical **Risk Scoring** and health trajectory tracking.
- **PME Compliance & Batch Scheduling** with automated WhatsApp reminders to employees.
- **Gemini AI Assistance** for clinical decision support and summary generation.
- **Supabase Cloud Backend** for user authentication, PostgreSQL database storage, and document uploads.

---

## ✨ Key Features

### 🔐 1. Role-Based Access Control (RBAC)
- **Admin**: System configuration, PME batch scheduling, analytics overview, and user activity logging.
- **Doctor**: Full clinical privileges — create/edit Form O medical records, perform risk assessments, consult AI assistance, access clinical analytics, and issue fitness certificates.
- **Medical Staff**: Manage employee directory, add new employee profiles, view medical history, and upload medical test reports.

### 📊 2. Executive Dashboard
- Real-time key metrics: Total Employees, Active PME Due, High/Critical Risk Count, and Overall Compliance Rate.
- Interactive urgent task alerts and upcoming examination notifications.
- Quick navigation shortcuts to core hospital workflows.

### 📁 3. Employee Directory & Profiles
- Comprehensive database of CCL mine employees with search, filter, and pagination.
- Detailed individual employee profiles including demographic details, blood group, dust exposure level, mine location, total service years, and historical medical records.
- Export employee records to Excel (`.xlsx`).

### 🩺 4. Digital Form O Medical Examination
- Standardized medical examination entry complying with coal mine health standards.
- **Patient Vitals**: Systolic/Diastolic BP, Pulse, Respiratory Rate, Temperature, Weight, Height, SPO2.
- **Spirometry**: Forced Vital Capacity (FVC), Forced Expiratory Volume (FEV1), FEV1/FVC ratio, and clinical interpretation.
- **Radiology**: Chest X-ray classification according to **ILO Pneumoconiosis standards** and diagnostic notes.
- Automated fitness determination (**Fit**, **Unfit**, **Fit with restrictions**).

### 📲 5. PME Tracker & WhatsApp Reminders
- Visual compliance countdowns and overdue employee identification.
- Single-click and batch scheduling for PME examination slots (selecting doctor, hospital wing, date, time slot).
- Direct WhatsApp notification integration via Twilio API to remind employees of upcoming PME schedules.
- Complete log of reminder dispatches and appointment schedules.

### 🧠 6. AI-Powered Risk Assessment & Insights
- Automated risk scoring engine evaluating dust exposure history, age, service years, spirometry impairment, and ILO radiography grade.
- Integrated **Gemini AI** (`@google/genai`) to generate automated clinical summaries, risk trajectory forecasts, and recommended medical follow-ups.

### 📈 7. Health Analytics & Disease Trends
- Visual health trend visualizations using Recharts.
- Department-wise and mine-wise risk distribution.
- Respiratory health vs. dust exposure correlation analytics.

### 📄 8. Document & Report Storage
- Secure file upload (X-rays, lab reports, ECGs) powered by Supabase Storage (`medical-reports` bucket).
- In-app document viewer with side-by-side preview functionality.

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |            React 19 + Vite            |
                                  |         (Frontend Client SPA)         |
                                  +-------------------+-------------------+
                                                      |
                         +----------------------------+----------------------------+
                         |                                                         |
                         v                                                         v
          +--------------+--------------+                           +--------------+--------------+
          |       Supabase Backend      |                           |     Express.js API Backend   |
          |  - Auth (JWT / RBAC)        |                           |  - Twilio WhatsApp Service  |
          |  - PostgreSQL Database      |                           |  - Phone Number Normalization|
          |  - Storage (Medical Reports)|                           +--------------+--------------+
          |  - Row Level Security (RLS) |                                          |
          +-----------------------------+                                          v
                                                                    +--------------+--------------+
                                                                    |     Twilio Messaging API    |
                                                                    |    (WhatsApp Dispatcher)    |
                                                                    +-----------------------------+
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Routing**: React Router DOM v7 (HashRouter)
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **State Management**: React Context (`AuthContext`, `PortalContext`)
- **Data Visualization**: Recharts v3
- **Animations**: Motion (Framer Motion v12)
- **Database & Auth Client**: `@supabase/supabase-js` v2
- **AI Integration**: `@google/genai` v2
- **Utilities**: `xlsx` for Excel export

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js v4
- **Services**: Twilio SDK v6 (WhatsApp API)
- **Middleware**: CORS, Dotenv

### Database & Cloud
- **Database**: Supabase PostgreSQL
- **Object Storage**: Supabase Storage (`medical-reports`)
- **Authentication**: Supabase Auth (Email & Password with metadata roles)

---

## 🗄️ Database Schema

The database relies on 5 SQL schema scripts located in the root directory:

| SQL File | Table / Resource Created | Purpose |
| :--- | :--- | :--- |
| `schema.sql` | `employees` | Stores employee demographics, mine name, dust exposure level, PME dates, risk score, and compliance status. |
| `schema_profiles.sql` | `profiles` & `on_auth_user_created` trigger | Extends Supabase `auth.users` to store full name and role (`Admin`, `Doctor`, `Medical Staff`). |
| `schema_medical_records.sql` | `medical_records` | Stores Form O medical examination results (Vitals, Spirometry, ILO Radiology, Fitness status). |
| `schema_reports.sql` | `reports` & `medical-reports` storage bucket | Tracks uploaded medical files/PDFs and provisions public storage bucket with RLS. |
| `schema_logs.sql` | `reminder_logs` & `schedule_logs` | Logs sent WhatsApp reminder notifications and scheduled PME appointments. |

---

## 📂 Project Structure

```text
ccl-employee-health-monitoring-portal/
├── backend/                        # Express.js API backend for Twilio WhatsApp
│   ├── controllers/
│   │   └── smsController.js        # WhatsApp notification controller
│   ├── routes/
│   │   └── sms.js                  # SMS/WhatsApp API routes
│   ├── services/
│   │   └── twilioService.js        # Twilio API client & phone formatter
│   ├── .env.example                # Backend environment template
│   ├── package.json                # Backend dependencies
│   └── server.js                   # Express server entry point
├── src/                            # React 19 frontend application
│   ├── components/                 # Reusable UI & layout components
│   │   ├── Header.jsx              # Navigation header with user badge
│   │   ├── Sidebar.jsx             # Main navigation sidebar
│   │   ├── Layout.jsx              # App layout wrapper
│   │   ├── ProtectedRoute.jsx      # Authentication guard
│   │   └── RoleProtectedRoute.jsx  # Role-based authorization guard
│   ├── context/                    # React Context providers
│   │   ├── AuthContext.jsx         # Supabase Auth state provider
│   │   └── PortalContext.jsx       # Global application data state
│   ├── pages/                      # Page components
│   │   ├── Dashboard.jsx           # Main stats & task dashboard
│   │   ├── EmployeeDirectory.jsx   # List, search, filter employees
│   │   ├── EmployeeProfile.jsx     # Detailed health profile
│   │   ├── AddEmployee.jsx         # Register new employee
│   │   ├── NewMedicalRecord.jsx    # Form O medical exam entry
│   │   ├── PmeTracker.jsx          # PME batch scheduling & WhatsApp reminders
│   │   ├── RiskAssessment.jsx      # Risk scoring & Gemini AI insights
│   │   ├── Analytics.jsx           # Health trends & chart analytics
│   │   ├── ReportsDocuments.jsx    # Upload & view medical documents
│   │   ├── Login.jsx               # User sign-in page
│   │   ├── Signup.jsx              # User registration page
│   │   └── AccessDenied.jsx        # Unauthorized access landing page
│   ├── utils/                      # Helper scripts & mock fallback data
│   │   ├── mockData.js             # Initial fallback dataset
│   │   └── securityValidation.js   # Input validation utilities
│   ├── App.jsx                     # Main router setup & route definitions
│   ├── main.jsx                    # React entry point
│   ├── index.css                   # Global styles & Tailwind import
│   └── supabaseClient.js           # Supabase JS client configuration
├── schema.sql                      # SQL setup: Employees table
├── schema_profiles.sql             # SQL setup: User profiles & auth trigger
├── schema_medical_records.sql      # SQL setup: Medical examination records
├── schema_reports.sql              # SQL setup: Document metadata & Storage bucket
├── schema_logs.sql                 # SQL setup: Notification & Schedule audit logs
├── .env.example                    # Frontend environment template
├── package.json                    # Frontend dependencies & scripts
├── vite.config.ts                  # Vite configuration
└── README.md                       # Project documentation
```

---

## ⚡ Prerequisites

Ensure you have the following installed/configured before running locally:

1. **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
2. **Supabase Project**: A free or paid account at [Supabase](https://supabase.com)
3. **Twilio Account**: A Twilio account with WhatsApp Sandbox or a verified WhatsApp Business Sender ([Twilio Console](https://console.twilio.com/))

---

## ⚙️ Environment Configuration

### 1. Frontend Environment Variables (`.env.local`)

Copy `.env.example` to `.env.local` in the project root directory:

```bash
cp .env.example .env.local
```

Fill in the required keys:

```env
# Supabase Configuration (Use Publishable/Anon key ONLY)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"

# Express API Backend URL (no trailing slash)
VITE_API_BASE_URL="http://localhost:5001"
```

### 2. Backend Environment Variables (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Fill in your backend configuration:

```env
PORT=5001
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Allowed CORS origins (comma-separated for production)
FRONTEND_URL="http://localhost:3000"
```

---

## 🚀 Local Setup & Running

### Step 1: Database Setup (Supabase)

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the SQL scripts in the following order:
   1. `schema.sql` (Creates `employees` table)
   2. `schema_profiles.sql` (Creates `profiles` table & auto-signup trigger)
   3. `schema_medical_records.sql` (Creates `medical_records` table)
   4. `schema_reports.sql` (Creates `reports` table & `medical-reports` bucket)
   5. `schema_logs.sql` (Creates `reminder_logs` & `schedule_logs` tables)

### Step 2: Install Dependencies & Run

#### Option A: Running from Terminal / Command Prompt

**Terminal 1 — Backend API:**
```bash
cd backend
npm install
npm start
```
*(Backend runs on `http://localhost:5001`)*

**Terminal 2 — Frontend App:**
```bash
npm install
npm run dev
```
*(Frontend runs on `http://localhost:3000`)*

#### Option B: Windows PowerShell Users
If PowerShell blocks script execution (`npm.ps1 cannot be loaded`), use `cmd /c`:

```powershell
# Terminal 1 (Backend)
cd backend
cmd /c npm start

# Terminal 2 (Frontend)
cd ccl-employee-health-monitoring-portal
cmd /c npm run dev
```

---

## 📡 API Endpoints

The Express backend exposes the following endpoint for WhatsApp reminders:

### `POST /api/sms/send-reminder`

Sends a formatted WhatsApp message to an employee.

- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "phone": "+919876543210",
    "employeeName": "Rajesh Kumar"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "WhatsApp reminder sent successfully",
    "sid": "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
  ```

---

## 🌐 Deployment Guide

### Backend Deployment (e.g., Render / Railway)

1. Root Directory: `backend`
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Set Environment Variables in host dashboard:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   - `FRONTEND_URL` *(URL of deployed frontend)*

### Frontend Deployment (e.g., Vercel / Netlify)

1. Root Directory: `./` (Project Root)
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variables in host dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_API_BASE_URL` *(URL of deployed backend API)*
5. Configure Supabase Authentication: Add your deployed frontend domain to **Supabase Auth -> URL Configuration -> Redirect URLs**.

---

## 🔒 Security & Production Guidelines

- **Never Commit Secrets**: Ensure `.env`, `.env.local`, and `backend/.env` remain in `.gitignore`.
- **Supabase Key Safety**: Only expose the Supabase `publishable/anon` key in frontend client bundles. Never use the `service_role` secret key on the frontend.
- **Row Level Security (RLS)**: The default SQL policies permit access to authenticated users. Customize policies in production according to fine-grained user roles.
- **Phone Number Normalization**: Phone numbers are automatically sanitized and formatted to E.164 standard (`+91XXXXXXXXXX`) prior to Twilio dispatch.

---

## 📄 License

This project is developed for **CCL Gandhinagar Hospital, Central Coalfields Limited**. All rights reserved.
