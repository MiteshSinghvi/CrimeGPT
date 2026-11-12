# CrimeGPT — Local AI Copilot & Cybercrime Investigation Platform

CrimeGPT is a privacy-first, offline-capable AI investigation copilot and case management platform built for cybercrime units and law enforcement teams. It combines a **local LLM + RAG legal intelligence pipeline** (Ollama + ChromaDB + FastAPI) with a **modern forensic web workspace** (React + Vite + Tailwind CSS + Supabase) to analyze FIR narratives, extract Indicators of Compromise (IoCs), map Indian statutory provisions (**BNS 2023**, **BNSS 2023**, and **IT Act 2000**), manage digital evidence with SHA-256 integrity hashing, and generate court-ready legal documents.

---

## Table of Contents

- [Key Features](#key-features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Step-by-Step Local Setup](#step-by-step-local-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Configure Environment Variables](#2-configure-environment-variables)
  - [3. Install & Prepare Ollama (Local AI Models)](#3-install--prepare-ollama-local-ai-models)
  - [4. Set Up the Python Backend](#4-set-up-the-python-backend)
  - [5. Set Up the React Frontend](#5-set-up-the-react-frontend)
  - [6. Set Up Supabase (Database, Auth & Storage)](#6-set-up-supabase-database-auth--storage)
  - [7. Run the Application](#7-run-the-application)
- [Optional: Seeding Demo Officers](#optional-seeding-demo-officers)
- [Backend API Endpoints](#backend-api-endpoints)
- [Security & Privacy](#security--privacy)

---

## Key Features

### 1. Local AI FIR Analysis & Statutory Mapping (RAG)
- **Zero-Cloud Sensitive Inference:** Narrative analysis runs locally via **Ollama (`llama3`)** and **ChromaDB (`nomic-embed-text`)**, keeping sensitive complainant and suspect data on your own machine.
- **Automated IoC Extraction:** Extracts technical artifacts from raw complaints including phone numbers, UPI IDs/VPAs, bank account numbers, email addresses, IP/MAC addresses, URLs, and consolidated monetary values/ranges.
- **Indian Legal Framework Mapping:** Retrieves and maps relevant provisions across **BNS 2023**, **BNSS 2023**, and the **IT Act 2000**, complete with severity assessments, executive summaries, and officer action checklists.
- **Offline Rule-Based Fallback:** Includes a local statutory scoring engine (`backend/legal_engine.py` + `backend/statutes_db.py` containing 196 statutory definitions) so core legal analysis and chatbot responses continue working even if Ollama is offline.
- **One-Click PDF Reports:** Export structured investigation reports directly to PDF (`jspdf`, `jspdf-autotable`, `html2pdf.js`).

### 2. Automated Legal & Investigation Document Generators
Generate pre-populated, printable/exportable drafts directly from case data and AI findings:
- **FIR (First Information Report)** (`FIRModal.tsx`)
- **Section 94 BNSS Notice** (`Sec94Modal.tsx`)
- **Section 106 BNSS Bank / Wallet Freeze Order** (`Sec106Modal.tsx`)
- **Seizure Memo / Panchnama** (`SeizureMemoModal.tsx`)
- **Arrest Memo** (`ArrestMemoModal.tsx`)
- **Remand Application** (`RemandApplicationModal.tsx`)
- **Chargesheet** (`ChargesheetModal.tsx`)
- **Bail Opposition Reply** (`BailOppositionModal.tsx`)
- **Search Warrant** (`SearchWarrantModal.tsx`)

### 3. Case Management & Digital Evidence Vault
- **Real-Time Case Dashboard:** Track cases by status (`critical`, `active`, `pending`, `closed`), priority, assigned officer, location, and progress with live Supabase subscriptions.
- **Forensic Evidence Tagging:** Upload evidence files to Supabase Storage with automatic client-side **SHA-256 hash generation** for chain-of-custody verification.

### 4. Case-Aware Floating AI Assistant
- Multi-turn streaming AI chat (`FloatingChatbot.tsx`) powered by FastAPI SSE + Ollama.
- Select an active case to ask context-aware questions about case status, narrative details, applicable sections, and next investigative steps, with persistent chat history in Supabase.

### 5. Role-Based Access Control (RBAC), Audit Logs & i18n
- **Badge ID or Email Login:** Officers can sign in using either their registered email or official badge number, with account lockout protection, OTP password reset, and admin approval (`account_status`).
- **5 Built-In Roles:** `Administrator`, `Senior Officer / Supervisor`, `Investigating Officer`, `Legal Officer`, and `Forensic Expert`.
- **Audit Logbook & System Settings:** Tracks authentication and operational events with IP metadata (`Logbook.tsx`) and lets administrators configure agency defaults (`Settings.tsx`).
- **Multilingual UI:** Supports **English**, **Hindi (हिन्दी)**, and **Gujarati (ગુજરાતી)** alongside light/dark themes.

---

## Architecture & Tech Stack

```text
+-----------------------------------+        SSE / REST        +-----------------------------------+
|      React + Vite Frontend        | -----------------------> |      FastAPI AI Backend           |
|  (Design CrimeGPT Web UI/)        |   http://localhost:8000  |           (app/main.py)           |
|  Tailwind v4, i18next, jsPDF      |                          |  Ollama (llama3 + nomic-embed)    |
+-----------------+-----------------+                          |  ChromaDB (./local_legal_db)      |
                  |                                            |  Offline Fallback (backend/)      |
                  | Auth, RLS DB & Storage                     +-----------------------------------+
                  v
+-----------------------------------+
|             Supabase              |
|  PostgreSQL + Auth + Storage      |
+-----------------------------------+
```

- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS v4, Lucide Icons, Recharts, i18next, jsPDF, html2pdf.js
- **Backend:** FastAPI, Uvicorn, Pydantic, Python-dotenv
- **Local AI & Vector Store:** Ollama (`llama3`, `nomic-embed-text`), ChromaDB
- **Database, Auth & Storage:** Supabase (PostgreSQL with Row-Level Security, Auth, Storage)

---

## Project Structure

```text
CrimeGPT/
├── app/                                # FastAPI AI backend
│   ├── main.py                         # API endpoints (/health, /api/v1/analyze-case, /api/v1/chat)
│   ├── fir_analyzer.py                 # Structured FIR analysis via Ollama
│   ├── legal_engine.py                 # ChromaDB vector retrieval using Ollama embeddings
│   └── models.py                       # Pydantic response & IoC schemas
├── backend/                            # Offline rule-based legal engine & statute corpus
│   ├── legal_engine.py                 # Regex IoC extractor, statute scorer, fallback chatbot
│   ├── statutes_db.py                  # Indian cybercrime statutory database (BNS/BNSS/IT Act)
│   └── generate.py                     # Statute helper generator
├── Design CrimeGPT Web UI/             # React + TypeScript + Vite frontend
│   ├── public/                         # Static assets (logo)
│   ├── src/
│   │   ├── app/App.tsx                 # Main application shell, RBAC, dashboard, cases, evidence
│   │   ├── components/                 # AIInvestigation, FloatingChatbot, Logbook, Settings, 9 legal modals
│   │   ├── lib/supabaseClient.ts       # Supabase client initialized from VITE_* env vars
│   │   ├── utils/                      # Audit logger & translations
│   │   └── i18n.ts                     # English / Hindi / Gujarati localization
│   ├── supabase/migrations/            # Audit logs, system settings, and RLS SQL migrations
│   ├── .env.example                    # Frontend environment template
│   └── package.json
├── local_legal_db/                     # Pre-built persistent ChromaDB vector index
├── scripts/                            # DB utility & seeding scripts
│   ├── build_fast_legal_db.py          # Rebuilds/populates local_legal_db via Ollama embeddings
│   ├── seed_officers.js                # Seeds demo officer accounts into Supabase
│   └── *.sql                           # Schema setup & RLS helper SQL scripts
├── supabase/migrations/                # Core Supabase migrations (approval workflow, AI history, FK fixes)
├── supabase_schema.sql                 # Base Supabase schema (cases & evidence_metadata)
├── .env.example                        # Root/backend environment template
├── requirements.txt                    # Python dependencies
├── launch_crimegpt.bat                 # One-click Windows launcher
└── launch_crimegpt.sh                  # One-click macOS/Linux launcher
```

---

## Prerequisites

Install the following tools on your device before setting up CrimeGPT:

1. **Git**
2. **Python 3.10+** (`python --version`)
3. **Node.js 18+ & npm** (`node -v`, `npm -v`)
4. **Ollama** — Download from [ollama.com](https://ollama.com/)
5. **A Supabase Project** — Create a free project at [supabase.com](https://supabase.com/)

---

## Step-by-Step Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MiteshSinghvi/CrimeGPT.git
cd CrimeGPT
```

### 2. Configure Environment Variables

Create the local `.env` files from the provided templates (`.env` files are gitignored so your credentials stay private):

**Root / Backend `.env`:**

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `.env`:
```env
# Used by scripts/seed_officers.js
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# FastAPI Backend Security & CORS
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
BACKEND_API_SECRET=

# Local AI Engine (Ollama + ChromaDB)
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_LLM_MODEL=llama3
OLLAMA_EMBED_MODEL=nomic-embed-text
CHROMA_DB_PATH=./local_legal_db
```

**Frontend `Design CrimeGPT Web UI/.env`:**

```bash
# Windows (PowerShell)
Copy-Item "Design CrimeGPT Web UI/.env.example" "Design CrimeGPT Web UI/.env"

# macOS / Linux
cp "Design CrimeGPT Web UI/.env.example" "Design CrimeGPT Web UI/.env"
```

Edit `Design CrimeGPT Web UI/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:8000
```

> **Where to find your Supabase keys:** Open your Supabase Dashboard → **Project Settings** → **API** → copy the **Project URL** (`VITE_SUPABASE_URL`) and **anon public key** (`VITE_SUPABASE_ANON_KEY`).

### 3. Install & Prepare Ollama (Local AI Models)

Start Ollama and pull the required LLM and embedding models:

```bash
ollama pull llama3
ollama pull nomic-embed-text
```

Make sure the Ollama service is running (`ollama serve`, or open the Ollama desktop app).

### 4. Set Up the Python Backend

Create a virtual environment named `venv` in the project root (expected by the launcher scripts) and install dependencies:

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

*(Optional)* A pre-built vector database is already included in `local_legal_db/`. If you ever want to rebuild or re-embed it with Ollama:
```bash
python scripts/build_fast_legal_db.py
```

### 5. Set Up the React Frontend

```bash
cd "Design CrimeGPT Web UI"
npm install
cd ..
```

### 6. Set Up Supabase (Database, Auth & Storage)

Open your **Supabase Dashboard → SQL Editor** and execute the SQL setup files in order:

1. **Core Tables & Policies:**
   - `scripts/restore_users_table.sql` (creates `public.users` + badge lookup policy)
   - `Design CrimeGPT Web UI/supabase/migrations/add_role_to_users.sql`
   - `scripts/setup_cases_table.sql` (creates `public.cases`)
   - `supabase_schema.sql` (creates `public.evidence_metadata`)
   - `scripts/final_schema_fix.sql` & `scripts/fix_evidence_rls.sql`
2. **Feature Migrations:**
   - `supabase/migrations/sync_users_trigger.sql`
   - `supabase/migrations/admin_approval_migration.sql`
   - `supabase/migrations/admin_role_update_policy.sql`
   - `supabase/migrations/ai_investigations.sql`
   - `supabase/migrations/fix_fk_cascade.sql`
   - `Design CrimeGPT Web UI/supabase/migrations/audit_logs.sql`
   - `Design CrimeGPT Web UI/supabase/migrations/fix_audit_logs_rls.sql`
   - `Design CrimeGPT Web UI/supabase/migrations/fix_users_rls.sql`
   - `Design CrimeGPT Web UI/supabase/migrations/system_settings.sql`
3. **Additional Tables Used by the UI:**
   - Ensure a `public.evidence` table (mirroring tagged evidence fields: `id`, `case_id`, `filename`, `file_size`, `sha256_hash`, `category`, `source`, `notes`, `file_url`, `upload_date`, `user_id`) and a `public.chat_history` table (`id`, `user_id`, `case_id`, `role`, `content`, `created_at`) exist with appropriate authenticated RLS policies.
   - Add a `username TEXT` column to `public.audit_logs` if not already present.
4. **Supabase Storage Buckets:**
   - Go to **Storage** in your Supabase Dashboard and create the **`evidence-vault`** and **`evidence`** buckets with policies allowing authenticated uploads/reads.

### 7. Run the Application

#### Option A: One-Click Launcher
- **Windows:**
  ```cmd
  .\launch_crimegpt.bat
  ```
- **macOS / Linux:**
  ```bash
  bash launch_crimegpt.sh
  ```

#### Option B: Run Manually in Two Terminals

**Terminal 1 — FastAPI AI Backend:**
```bash
# Activate venv first (.\venv\Scripts\activate on Windows or source venv/bin/activate on macOS/Linux)
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — React Frontend:**
```bash
cd "Design CrimeGPT Web UI"
npm run dev
```

Open your browser to **http://localhost:5173** and verify backend health at **http://localhost:8000/health**.

---

## Optional: Seeding Demo Officers

To populate sample officer accounts across all 5 RBAC roles using your `.env` credentials:

```bash
SEED_OFFICER_PASSWORD="YourStrongPassword123!" node scripts/seed_officers.js
```

> Note: If Supabase email confirmation is enabled in your project, confirm the seeded accounts in **Supabase → Authentication → Users** (or disable email confirmation during local testing) and set `account_status = 'approved'` in `public.users` for your initial Administrator account.

---

## Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Returns backend status and Ollama connectivity check |
| `POST` | `/api/v1/analyze-case` | Streams structured FIR analysis, IoCs, and RAG-retrieved legal provisions via SSE |
| `POST` | `/api/v1/chat` | Streams case-aware AI copilot replies via SSE (falls back to offline statute engine if Ollama is unavailable) |

---

## Security & Privacy

- **Never commit `.env` files:** `.env` and `.env.*` (except `!.env.example`) are excluded in `.gitignore`.
- **CORS Protection:** `ALLOWED_ORIGINS` restricts cross-origin requests to configured frontend origins.
- **Optional Internal API Secret:** Set `BACKEND_API_SECRET` in `.env` when deploying behind a reverse proxy that injects the `X-Api-Key` header (leave empty for local development).
- **Local Data Sovereignty:** Case narratives sent to `/api/v1/analyze-case` and `/api/v1/chat` are processed locally by Ollama and ChromaDB without third-party LLM API calls.
