# PSYSCAN AI – AI-Assisted Psychological Screening Application

![PSYSCAN AI Banner](frontend/public/logo.svg)

**PSYSCAN AI** is a production-grade psychological screening and clinical decision-support platform designed to help psychologists and clinicians collect standardized assessment data, automatically calculate authorized questionnaire scores, identify symptom patterns, estimate severity, flag potential risks, generate AI-assisted screening reports, and allow a qualified psychologist (configured with **Shalini Devi V**) to review, modify, confirm, or reject AI-generated suggestions.

---

> [!IMPORTANT]
> **CLINICAL DISCLAIMER & SAFETY NOTICE**
> "PSYSCAN AI is intended for psychological screening and clinical decision support. It does not provide a medical or psychological diagnosis. AI-generated information is probabilistic and must be independently reviewed by a qualified mental health professional. Clinical decisions must be based on comprehensive professional assessment."

---

## 🏗️ Production Architecture

```text
                        GITHUB REPOSITORY
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
                 ▼                             ▼
       VERCEL FRONTEND                  VERCEL BACKEND
   React 18 + Vite (SPA)            Node.js + Express Serverless
                 │                             │
                 │      HTTPS REST API         │
                 └──────────────┬──────────────┘
                                │
                                ▼
                       CLOUD MYSQL DATABASE
               (Aiven / TiDB Cloud / AWS RDS / Railway)
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- **MySQL Server**: 8.0+ running on `localhost:3306`

### 2. Configure Local Database
1. In your local MySQL server, create a database:
   ```sql
   CREATE DATABASE psyscan_db;
   ```

2. Create `backend/.env` with your local credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/psyscan_db"
   JWT_SECRET="psyscan-local-dev-jwt-secret-2026"
   JWT_REFRESH_SECRET="psyscan-local-dev-refresh-jwt-secret-2026"
   FRONTEND_URL="http://localhost:5173"
   CORS_ORIGIN="http://localhost:5173"
   ```

### 3. Initialize & Seed Local Database
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 4. Start Local Backend & Frontend
```bash
# Terminal 1: Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Clinical Credentials

| Role | Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Psychologist** | **Shalini Devi V** | `shalini.devi@psyscan.local` | `Password123!` | Primary Clinical Reviewer |
| **Administrator** | Dr. Ramesh Kumar | `admin@psyscan.local` | `Password123!` | System Administrator |
| **Assessor** | Ananya Sharma | `assessor@psyscan.local` | `Password123!` | Psychometric Assessor |
| **Demo Patient** | Demo Patient | `patient.demo@psyscan.local` | `Password123!` | Patient Portal User |

---

## ☁️ Cloud MySQL Setup

For production on Vercel, the backend connects to a cloud-hosted MySQL database (e.g., **Aiven**, **TiDB Cloud**, **Railway**, or **AWS RDS**).

### Method A: Initialize via Prisma CLI (Recommended)
```bash
cd backend
npx prisma generate
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DB_NAME?sslaccept=strict" npx prisma db push
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DB_NAME?sslaccept=strict" npm run prisma:seed
```

### Method B: Initialize via Raw SQL
You can also import the provided SQL scripts directly in your cloud provider's web SQL console:
1. Run [`backend/database/schema.sql`](backend/database/schema.sql) to create all tables and foreign keys.
2. Run [`backend/database/seed.sql`](backend/database/seed.sql) to populate standard psychometric assessments and users.

---

## 🚀 Deploying to Vercel

The application is deployed as **two separate projects** from the same GitHub repository:

### Step 1: Deploy Backend (`psyscan-backend`)
1. In the [Vercel Dashboard](https://vercel.com), click **Add New...** ➔ **Project** ➔ Import this repository.
2. Set **Project Name**: `psyscan-backend`.
3. Set **Root Directory**: `backend`.
4. Set **Framework Preset**: `Other` (or `Node.js`).
5. Add the following **Environment Variables**:
   - `DATABASE_URL`: `mysql://USER:PASSWORD@HOST:PORT/DB_NAME?sslaccept=strict` *(Your Cloud MySQL URL)*
   - `JWT_SECRET`: `psyscan-super-secure-production-jwt-secret-key-2026`
   - `JWT_REFRESH_SECRET`: `psyscan-super-secure-production-refresh-secret-key-2026`
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: `https://<YOUR_FRONTEND_PROJECT>.vercel.app`
   - `CORS_ORIGIN`: `https://<YOUR_FRONTEND_PROJECT>.vercel.app`
   - `AI_PROVIDER`: `mock`
6. Click **Deploy**.
7. Test the health endpoint: `https://<YOUR_BACKEND>.vercel.app/api/health` ➔ should return `{"status":"ok","database":"connected"}`.

### Step 2: Deploy Frontend (`psyscan-frontend`)
1. In Vercel Dashboard, click **Add New...** ➔ **Project** ➔ Import the same repository.
2. Set **Project Name**: `psyscan-frontend`.
3. Set **Root Directory**: `frontend`.
4. Set **Framework Preset**: `Vite`.
5. Add the following **Environment Variable**:
   - `VITE_API_URL`: `https://<YOUR_BACKEND>.vercel.app` *(The backend URL from Step 1)*
6. Click **Deploy**.

---

## 🛡️ Security Best Practices
- **No Direct DB Access from Browser**: The browser only communicates with the Vercel serverless backend over HTTPS.
- **Secrets Isolation**: `DATABASE_URL`, `JWT_SECRET`, and API keys are stored solely in Vercel Backend Environment Variables and are never exposed to the client.
- **Connection Reuse**: Prisma client is cached on `globalThis` to preserve connections across warm serverless functions.
- **Deterministic Scoring**: Clinical questionnaire scoring is mathematically deterministic and executed purely server-side.
