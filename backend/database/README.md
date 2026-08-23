# PSYSCAN AI - Cloud MySQL Database Setup Guide

This directory contains the database schema and seed data for **PSYSCAN AI**.

---

## 🛠️ Method 1: Initialize Cloud MySQL via Prisma CLI (Recommended)

When you create a Cloud MySQL instance (on **Aiven**, **TiDB Cloud**, **Railway**, **AWS RDS**, etc.):

1. Copy your cloud MySQL connection string:
   ```env
   DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE_NAME?sslaccept=strict"
   ```

2. Run the push and seed commands from the `backend/` folder:
   ```bash
   cd backend
   npx prisma generate
   DATABASE_URL="<YOUR_CLOUD_MYSQL_URL>" npx prisma db push
   DATABASE_URL="<YOUR_CLOUD_MYSQL_URL>" npm run prisma:seed
   ```

---

## 📄 Method 2: Direct Raw SQL Import (Cloud Web Console / phpMyAdmin)

If you prefer to import raw SQL scripts directly through your cloud database provider's web console, MySQL Workbench, or CLI:

1. **Create Database & Tables**: Run [`schema.sql`](./schema.sql)
2. **Seed Initial Assessments & Users**: Run [`seed.sql`](./seed.sql)

---

## 📊 Database Entity Overview

| Table Name | Description |
| :--- | :--- |
| `users` | Psychologists, Clinicians, Administrators, and Patients |
| `patients` | Patient records, demographics, and clinical identifiers (`PSY-xxxxx`) |
| `patient_contacts` | Addresses, phone numbers, and emergency contact details |
| `patient_histories` | Psychiatric complaints, symptom duration, trauma & family history |
| `consent_records` | Screening consent records and audit metadata |
| `assessment_domains` | Assessment classifications (Depression, Anxiety, Distress, Stress) |
| `assessments` | Standardized psychometric tools (PHQ-9, GAD-7, GHQ-12, DASS-21, PSS-10) |
| `assessment_versions` | Versioned instructions and question sets |
| `assessment_questions` | Individual assessment items with reverse-scoring rules |
| `assessment_options` | Scale options (e.g. 0 to 3 Likert scales) |
| `assessment_scoring_rules` | Deterministic score calculation and cutoff definitions |
| `assessment_severity_bands` | Severity ranges, clinical labels, and color indicators |
| `assessment_sessions` | Patient testing sessions and completion lifecycle |
| `assessment_responses` | Granular item responses recorded per session |
| `assessment_scores` | Computed total scores, severity bands, and risk flags |
| `ai_analyses` | Explainable AI pattern observations and clinical suggestions |
| `ai_suggestions` | Granular suggestions with accept/modify/reject review decisions |
| `clinical_reviews` | Psychologist clinical formulation, observations, and final sign-off |
| `reports` | AI-assisted clinical screening reports |
| `follow_up_plans` | Scheduled review sessions and follow-up tracking |
| `audit_logs` | Audit trail of clinical decisions and data modifications |
| `notifications` | In-app alerts for pending reviews and risk notifications |
| `system_settings` | Dynamic platform parameters and clinical disclaimer configuration |
