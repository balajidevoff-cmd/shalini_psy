# PSYSCAN AI – AI-Assisted Psychological Screening Application

![PSYSCAN AI Banner](frontend/public/logo.svg)

**PSYSCAN AI** is a production-quality, secure psychological screening and clinical decision-support platform designed to help psychologists and clinicians collect standardized assessment data, automatically calculate authorized questionnaire scores, identify symptom patterns, estimate severity, flag potential risks, generate AI-assisted screening reports, and allow a qualified psychologist (configured with **Shalini Devi V**) to review, modify, confirm, or reject AI-generated suggestions.

---

> [!IMPORTANT]
> **CLINICAL DISCLAIMER & SAFETY NOTICE**
> "PSYSCAN AI is intended for psychological screening and clinical decision support. It does not provide a medical or psychological diagnosis. AI-generated information is probabilistic and must be independently reviewed by a qualified mental health professional. Clinical decisions must be based on comprehensive professional assessment."

---

## Key Features

1. **Deterministic Scoring Engine**
   - Official scores and severity classifications are computed deterministically (Sum, Weighted, Subscale, Cutoffs, Reverse scoring).
   - Absolute clinical safety guarantee: AI *never* calculates official questionnaire scores arbitrarily.
2. **AI-Assisted Decision Support Pipeline**
   - Multi-provider abstraction (`MockClinicalAIProvider`, `GeminiAIProvider`, `OpenAIProvider`).
   - Symptom pattern recognition, severity estimation, risk flagging, further assessment suggestions, and uncertainty notes.
3. **Interactive Psychologist Review**
   - Dedicated split-screen workspace with individual `[Accept]`, `[Modify]`, `[Reject]` controls for each AI suggestion.
   - Comprehensive mental status observations, risk level justification, and final clinical impressions signed by **Shalini Devi V, Senior Clinical Psychologist**.
4. **Professional PDF Reports**
   - Server-side PDF generation via PDFKit with detailed score breakdowns, subscale charts, clinician signatures, and clinical disclaimers.
5. **Role-Based Access Control (RBAC)**
   - Roles: `ADMIN`, `PSYCHOLOGIST`, `ASSESSOR`, `PATIENT`.
   - Immutable audit logging for HIPAA/clinical compliance.

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, TanStack Query, Recharts, Lucide React, Zod.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, MySQL 8+, JWT Authentication, bcryptjs, PDFKit.
- **AI Layer**: Provider abstraction supporting Mock Heuristic Engine, Google Gemini 1.5, OpenAI GPT-4o.

---

## Default Demo Credentials

| Role | Name | Email | Password | Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Psychologist** | **Shalini Devi V** | `shalini.devi@psyscan.local` | `Password123!` | Primary Clinical Reviewer |
| **Administrator** | Dr. Ramesh Kumar | `admin@psyscan.local` | `Password123!` | System Administrator |
| **Assessor** | Ananya Sharma | `assessor@psyscan.local` | `Password123!` | Psychometric Assessor |
| **Patient** | Demo Patient | `patient.demo@psyscan.local` | `Password123!` | Patient Portal User |

---

## Project Structure

```text
psyscan-ai/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # 30+ relational MySQL models
│   │   └── seed.ts                # Database seed script with Shalini Devi V
│   ├── src/
│   │   ├── ai/                    # Multi-provider AI screening service
│   │   ├── auth/                  # JWT and RBAC guards
│   │   ├── config/                # Environment loader & clinical disclaimer
│   │   ├── controllers/           # REST API endpoints
│   │   ├── database/              # Prisma client
│   │   ├── middleware/            # Error handling & logging
│   │   ├── reports/               # PDFKit server-side report generator
│   │   ├── routes/                # Express API routes
│   │   ├── scoring/               # Deterministic scoring engine
│   │   ├── utils/                 # Audit logging & response formatters
│   │   ├── validators/            # Zod validation schemas
│   │   └── server.ts              # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── api/                   # Axios client
│   │   ├── components/            # ScoreCard, Badges, Header, Sidebar, Disclaimer
│   │   ├── contexts/              # AuthContext
│   │   ├── layouts/               # AppLayout
│   │   ├── pages/                 # Dashboard, Patients, Clinical Review, Reports, etc.
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx                # Routing
│   │   └── main.tsx               # Entry point
│   ├── package.json
│   └── vite.config.ts
├── .env.example
└── README.md
```

---

## Quick Start & Installation

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- **MySQL Server**: 8.0+

### 2. Configure Database & Environment
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Ensure `DATABASE_URL` in `backend/.env` points to your MySQL instance:
```env
DATABASE_URL="mysql://root:password@localhost:3306/psyscan_ai"
```

### 3. Backend Setup & Seeding
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```
The backend will be live at `http://localhost:5000` (API documentation at `http://localhost:5000/api/docs`).

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend application will be live at `http://localhost:5173`.

---

## Database Management & Backup

### Prisma Studio
Launch the visual database browser:
```bash
cd backend
npx prisma studio
```

### Backup Database (MySQL)
```bash
mysqldump -u root -p psyscan_ai > psyscan_ai_backup.sql
```

### Restore Database
```bash
mysql -u root -p psyscan_ai < psyscan_ai_backup.sql
```

---

## Clinical Safety Guidelines

1. **No Autonomous Diagnoses**: The system provides decision-support probability bands and symptom pattern observations only.
2. **Review Requirement**: AI suggestions do not appear on final official reports unless confirmed or modified by the reviewing psychologist.
3. **Elevated Risk Escalation**: Any patient response triggering high-risk criteria (e.g. self-harm or suicidal ideation) enforces mandatory clinical justification prior to report finalization.
