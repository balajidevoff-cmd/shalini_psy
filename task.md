# PSYSCAN AI – AI-ASSISTED PSYCHOLOGICAL SCREENING APPLICATION

## ROLE

You are a senior full-stack software architect, UI/UX designer, database architect, AI engineer, cybersecurity engineer, and QA engineer.

Build a production-quality web application called:

**PSYSCAN AI – AI-Assisted Psychological Screening Application**

The application is a secure psychological screening and clinical decision-support platform designed to help psychologists/clinicians collect standardized assessment data, automatically calculate authorized questionnaire scores, identify symptom patterns, estimate severity, flag potential risks, generate an AI-assisted screening report, and allow a qualified psychologist to review, modify, confirm, or reject AI-generated suggestions.

IMPORTANT:

This application MUST NOT claim to diagnose a mental health condition.

The system is a screening and clinical decision-support tool only.

The final clinical interpretation, diagnosis, treatment decision, referral decision, and intervention plan MUST remain under the control of a qualified psychologist/clinician.

The UI must clearly communicate:

"PSYSCAN AI is a screening and clinical decision-support tool. It does not provide a diagnosis. Final diagnosis and treatment decisions must be made by a qualified mental health professional after comprehensive clinical assessment."

Do not create autonomous diagnosis functionality.

---

# 1. TECHNOLOGY STACK

Use the following architecture.

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* TanStack Query
* Recharts
* React Hook Form
* Zod
* Lucide React icons

## Backend

* Node.js
* TypeScript
* Express.js
* REST API
* JWT authentication
* bcrypt/argon2 password hashing
* Prisma ORM
* MySQL

## AI / Analytics

Initially implement AI functionality behind a clean service abstraction.

Preferred architecture:

Frontend
↓
Node.js API
↓
Scoring Engine
↓
AI Analysis Service
↓
Database

The AI service can initially use a mock/local implementation.

Design the system so an external AI provider such as OpenAI/Gemini can later be connected through an environment variable.

Never expose an AI API key in the frontend.

## Database

Use:

MySQL 8+

ORM:

Prisma

Create proper migrations.

Do NOT store application data in JSON files as the primary database.

---

# 2. PROJECT ARCHITECTURE

Create this structure:

psyscan-ai/

```
frontend/
    src/
        components/
        pages/
        layouts/
        hooks/
        services/
        api/
        types/
        utils/
        contexts/
        charts/
        forms/
        assets/

backend/
    src/
        controllers/
        routes/
        services/
        middleware/
        validators/
        utils/
        ai/
        scoring/
        reports/
        auth/
        database/
        config/

prisma/
    schema.prisma
    migrations/
    seed.ts

docs/

.env.example

README.md
```

Use clean separation between:

UI
Business Logic
Database
Authentication
Assessment Engine
AI Engine
Reporting
Audit Logging

---

# 3. USER ROLES

Implement role-based access control.

Roles:

1. ADMIN
2. PSYCHOLOGIST
3. ASSESSOR
4. PATIENT

## ADMIN

Can:

* Manage users
* Manage psychologists
* Manage assessment definitions
* Manage system settings
* View audit logs
* Manage role permissions
* View system statistics

## PSYCHOLOGIST

Can:

* Create patients
* View assigned patients
* Create assessment sessions
* Assign assessments
* Review completed assessments
* View questionnaire scores
* View symptom patterns
* View risk flags
* Review AI-generated suggestions
* Modify AI suggestions
* Confirm/reject AI suggestions
* Add clinical observations
* Add clinical notes
* Create final clinical impression
* Generate PDF reports
* Create referral/intervention plans
* Monitor follow-up

## ASSESSOR

Can:

* Register patients
* Conduct assigned assessments
* Enter questionnaire responses
* View assessment progress
* Submit assessments

Cannot:

* Confirm diagnosis
* Finalize clinical impression
* Modify protected clinical conclusions

## PATIENT

Can:

* View assigned questionnaires
* Complete permitted self-report assessments
* View appointment/assessment status
* View permitted reports
* View follow-up instructions

Patients must NOT see internal AI reasoning, confidential clinician notes, risk-review workflow, or restricted information.

---

# 4. AUTHENTICATION

Implement secure authentication.

Features:

* Login
* Logout
* JWT access token
* Refresh token
* Password hashing
* Role-based authorization
* Session expiration
* Password reset architecture
* Account activation/deactivation

Do not store passwords as plain text.

Use:

bcrypt or Argon2.

Implement middleware:

requireAuth()
requireRole()
requirePermission()

---

# 5. MAIN APPLICATION FLOW

The main workflow should follow the provided PSYSCAN blueprint:

INPUT FACTORS
↓
STANDARDIZED ASSESSMENTS
↓
AI-ASSISTED SCREENING
↓
PSYCHOLOGIST REVIEW
↓
OUTPUT & REPORT
↓
OUTCOMES & FOLLOW-UP

---

# 6. DASHBOARD

Create a professional clinical dashboard.

Dashboard cards:

* Total Patients
* Active Assessments
* Completed Assessments
* Pending Reviews
* High-Risk Flags Requiring Review
* Follow-ups Due
* Reports Generated

Charts:

* Assessment completion trend
* Severity distribution
* Assessment category distribution
* Follow-up status
* Risk flag trend

Do not present these statistics as medical diagnoses.

---

# 7. PATIENT MANAGEMENT

Create a Patient Management module.

Patient fields:

* Patient ID
* First Name
* Last Name
* Date of Birth
* Age
* Gender
* Education
* Occupation
* Marital Status
* Socioeconomic Status
* Contact information
* Emergency contact
* Assigned psychologist
* Registration date
* Status

Do not expose unnecessary patient information to users without permission.

Create:

Patient List

Patient Search

Patient Profile

Patient Assessment History

Patient Timeline

Patient Reports

Patient Follow-up

---

# 8. INPUT FACTORS

Implement the following factor categories exactly according to the provided blueprint.

## A. Demographic Factors

* Age
* Gender
* Education
* Occupation
* Marital Status
* Socioeconomic Status

## B. Emotional Factors

* Mood
* Anxiety
* Stress
* Anger
* Emotional Regulation
* Self-esteem

## C. Cognitive Factors

* Attention
* Concentration
* Memory
* Executive Function
* Decision Making
* Problem Solving

## D. Behavioral Factors

* Sleep
* Eating Habits
* Physical Activity
* Screen Time
* Substance Use
* Daily Functioning

## E. Social & Environmental Factors

* Family Relationships
* Peer Support
* Social Functioning
* Financial Stress
* Work Stress
* Academic Stress

## F. Clinical & Risk Factors

* Presenting Complaints
* Symptom Duration
* Symptom Severity
* Medical History
* Family History
* Suicidal Thoughts
* Self-harm
* Trauma
* Major Life Events

Risk-related information must be handled with special security and must generate an appropriate clinician review flag when configured thresholds are met.

---

# 9. STANDARDIZED ASSESSMENT MODULE

Create a dynamic assessment engine.

The assessment engine must NOT hard-code every questionnaire.

Create database-driven assessment definitions.

Each assessment should have:

* Assessment ID
* Name
* Short Name
* Domain
* Description
* Age Range
* Version
* Administration Method
* Question List
* Response Type
* Scoring Method
* Scoring Rules
* Severity Bands
* Interpretation Rules
* Licensing Status
* Active/Inactive status

Example domains:

* Intellectual Disability
* Mood
* Intellectual Functioning
* Attention & Executive Function
* Anxiety
* Other Relevant Scales

---

# 10. ASSESSMENTS FROM BLUEPRINT

Create database records for the following assessment categories.

## INTELLECTUAL DISABILITY

Examples from the blueprint:

* Vineland Adaptive Behavior Scales – 3rd Edition
* Adaptive Behavior Assessment System – 3rd Edition
* Developmental Disability Screening Scale
* DSM-5-TR intellectual disability criteria

## MOOD

* Beck Depression Inventory-II
* Patient Health Questionnaire-9
* Hamilton Depression Rating Scale
* Young Mania Rating Scale
* Profile of Mood States

## INTELLECTUAL FUNCTIONING

* Wechsler Adult Intelligence Scale-IV
* Wechsler Intelligence Scale for Children-V
* Stanford-Binet Intelligence Scales
* Raven's Progressive Matrices

## ATTENTION & EXECUTIVE FUNCTION

* Conners Continuous Performance Test
* Conners Adult ADHD Rating Scale
* Behavior Rating Inventory of Executive Function
* Stroop Color and Word Test

## ANXIETY

* Generalized Anxiety Disorder Scale-7
* Beck Anxiety Inventory
* Hamilton Anxiety Rating Scale
* State-Trait Anxiety Inventory

## OTHER RELEVANT SCALES

* Autism Spectrum Quotient
* PTSD Checklist
* Insomnia Severity Index
* Perceived Stress Scale

IMPORTANT:

Do NOT reproduce proprietary/copyrighted questionnaire questions unless the project has the required license or permission.

Create the system so authorized questionnaire content can be imported later.

For development/demo purposes, use clearly labeled sample/demo assessment questions and synthetic data.

---

# 11. ASSESSMENT DATABASE DESIGN

Create tables/models for:

Assessment

AssessmentVersion

AssessmentDomain

AssessmentQuestion

AssessmentOption

AssessmentScoringRule

AssessmentSeverityBand

AssessmentSession

AssessmentResponse

AssessmentScore

AssessmentInterpretation

AssessmentAssignment

AssessmentResult

Example relationship:

Assessment
↓
AssessmentVersion
↓
AssessmentQuestion
↓
AssessmentOption

AssessmentSession
↓
AssessmentResponse
↓
AssessmentScore
↓
AssessmentInterpretation

---

# 12. ASSESSMENT SESSION

A psychologist should be able to:

1. Select patient
2. Select assessment
3. Create assessment session
4. Assign assessment
5. Select administration type
6. Start assessment
7. Save progress
8. Resume later
9. Complete assessment
10. Automatically calculate score
11. Generate interpretation
12. Send result for psychologist review

Assessment status:

DRAFT

IN_PROGRESS

COMPLETED

UNDER_REVIEW

REVIEWED

FINALIZED

ARCHIVED

---

# 13. QUESTIONNAIRE UI

Create a clean clinical questionnaire interface.

Features:

* Progress indicator
* Section navigation
* Previous button
* Next button
* Save and continue
* Auto-save
* Validation
* Required question indicators
* Review answers
* Submit assessment

For large assessments, support pagination.

Do not allow accidental data loss.

---

# 14. SCORING ENGINE

Build a generic scoring engine.

The scoring engine must support:

* Sum scoring
* Weighted scoring
* Reverse scoring
* Subscale scoring
* Raw score
* Standard score
* Percentile
* Severity bands
* Configurable thresholds

Example:

Response
↓
Question Score
↓
Subscale Score
↓
Total Score
↓
Severity Band
↓
Interpretation

Never allow the AI model to arbitrarily calculate official questionnaire scores.

Official scoring logic must be deterministic and version-controlled.

---

# 15. AI-ASSISTED SCREENING PROCESS

Implement an AI analysis pipeline.

Pipeline:

Questionnaire Responses
↓
Validated Scores
↓
Patient Factors
↓
Assessment History
↓
Symptom Pattern Analysis
↓
Severity Estimation
↓
Risk Flagging
↓
Further Assessment Suggestions
↓
AI Screening Summary
↓
Psychologist Review

AI output must be labeled:

"AI-ASSISTED SCREENING SUGGESTION – REQUIRES CLINICIAN REVIEW"

---

# 16. AI OUTPUT

AI may generate:

* Summary of reported symptoms
* Pattern observations
* Potential areas of concern
* Severity observations based on configured assessment results
* Possible areas requiring further assessment
* Suggested follow-up questions
* Suggested referrals
* Suggested monitoring points

AI must NOT output:

* "The patient definitely has depression"
* "The patient has schizophrenia"
* "The patient is diagnosed with ADHD"
* Autonomous treatment decisions
* Autonomous medication recommendations
* Definitive clinical diagnosis

Instead use wording such as:

"Screening results indicate elevated symptoms that may warrant further clinical evaluation."

---

# 17. AI EXPLANABILITY

For every AI suggestion store:

* Suggestion ID
* Patient ID
* Assessment Session ID
* AI model
* Model version
* Prompt version
* Generated timestamp
* Input references
* Suggestion
* Confidence/uncertainty indicator where appropriate
* Status
* Psychologist decision
* Psychologist comment

Status:

PENDING

ACCEPTED

MODIFIED

REJECTED

---

# 18. PSYCHOLOGIST REVIEW

Create a dedicated review screen.

Workflow:

Clinical Interview & Observation
↓
Review AI-Generated Screening Report
↓
Integration with Clinical Judgment
↓
Modify / Confirm / Reject AI Suggestions
↓
Final Clinical Impression

The psychologist should be able to:

* View assessment scores
* View patient factors
* View assessment history
* View AI suggestions
* Accept suggestion
* Modify suggestion
* Reject suggestion
* Add clinical notes
* Add observations
* Add risk assessment
* Add recommendations
* Add further assessments
* Add referral
* Finalize review

---

# 19. CLINICAL REVIEW FORM

Create sections:

## Clinical Interview

Textarea.

## Clinical Observations

Textarea.

## Assessment Summary

Automatically populated.

## Areas of Concern

Clinician editable.

## Risk Review

Options:

LOW

MODERATE

HIGH

Require justification for elevated risk levels.

## Further Assessment

Multi-select/list.

## Recommendations

Rich text editor.

## Referral

Referral type.

## Follow-up Plan

Date + notes.

## Final Clinical Impression

Clinician-only editable field.

Require explicit confirmation before finalization.

---

# 20. RISK MANAGEMENT

Risk information is highly sensitive.

Implement special handling.

Possible flags:

* Self-harm concern
* Suicidal ideation concern
* Severe symptom score
* Functional impairment
* Other configured clinical risk indicators

When a configured high-risk response occurs:

Show:

"HIGH PRIORITY CLINICAL REVIEW REQUIRED"

Do NOT automatically diagnose.

Do NOT automatically prescribe treatment.

Do NOT claim that AI can determine imminent danger with certainty.

Require clinician review.

Record all risk-related actions in the audit log.

---

# 21. OUTPUT & REPORT

Generate a professional screening report.

Report sections:

1. Patient Information
2. Assessment Date
3. Assessments Administered
4. Questionnaire Scores
5. Severity Summary
6. Areas of Concern
7. Risk Level
8. AI-Assisted Screening Summary
9. Psychologist Review
10. Clinical Observations
11. Recommendations
12. Suggested Further Assessments
13. Referral / Intervention Plan
14. Follow-up Plan
15. Final Clinical Impression
16. Disclaimer

Include:

"AI-assisted content requires qualified clinician review."

---

# 22. PDF REPORT GENERATION

Implement server-side PDF generation.

PDF should contain:

PSYSCAN AI logo

Patient information

Assessment information

Tables

Score summaries

Severity indicators

Clinical review

Recommendations

Follow-up

Disclaimer

Report version

Generated date

Reviewed by psychologist

Do not include AI suggestions that were rejected by the psychologist in the final clinical report unless explicitly marked as rejected/internal information.

---

# 23. DATABASE DESIGN

Use MySQL with Prisma.

Create at least these models:

User

Role

Permission

Patient

PatientContact

PatientHistory

AssessmentDomain

Assessment

AssessmentVersion

AssessmentQuestion

AssessmentOption

AssessmentScoringRule

AssessmentSeverityBand

AssessmentAssignment

AssessmentSession

AssessmentResponse

AssessmentScore

AssessmentSubscaleScore

AIAnalysis

AISuggestion

ClinicalReview

ClinicalObservation

RiskAssessment

Recommendation

Referral

FollowUpPlan

Report

AuditLog

Notification

SystemSetting

ConsentRecord

---

# 24. DATABASE RELATIONSHIPS

Implement proper foreign keys.

Example:

User
↓
Patient
↓
AssessmentAssignment
↓
AssessmentSession
↓
AssessmentResponse
↓
AssessmentScore

AssessmentSession
↓
AIAnalysis
↓
AISuggestion
↓
ClinicalReview
↓
Report

Patient
↓
FollowUpPlan

User
↓
AuditLog

---

# 25. IMPORTANT DATABASE FIELDS

Patient:

id
patient_code
first_name
last_name
date_of_birth
gender
education
occupation
marital_status
socioeconomic_status
created_at
updated_at

Assessment:

id
name
short_name
domain_id
description
version
age_min
age_max
administration_type
licensing_status
active

AssessmentQuestion:

id
assessment_version_id
question_number
question_text
question_type
required
order_index

AssessmentResponse:

id
session_id
question_id
response_value
response_text
answered_at

AssessmentScore:

id
session_id
raw_score
standard_score
percentile
severity
interpretation

AIAnalysis:

id
session_id
model_name
model_version
prompt_version
summary
risk_observation
generated_at
status

ClinicalReview:

id
session_id
psychologist_id
clinical_notes
clinical_observations
risk_level
final_impression
status
reviewed_at

---

# 26. CONSENT MANAGEMENT

Before collecting sensitive psychological information, implement consent.

Store:

Consent ID

Patient ID

Consent type

Consent version

Consent timestamp

Consent status

Accepted by

IP/device metadata where legally appropriate

Provide a consent screen before assessment.

---

# 27. AUDIT LOG

Every sensitive operation must be logged.

Examples:

LOGIN

PATIENT_CREATED

PATIENT_UPDATED

ASSESSMENT_STARTED

ASSESSMENT_COMPLETED

ASSESSMENT_VIEWED

SCORE_GENERATED

AI_ANALYSIS_GENERATED

AI_SUGGESTION_ACCEPTED

AI_SUGGESTION_MODIFIED

AI_SUGGESTION_REJECTED

CLINICAL_REVIEW_CREATED

REPORT_GENERATED

REPORT_VIEWED

REPORT_DOWNLOADED

RISK_FLAG_CREATED

FOLLOWUP_CREATED

Store:

user_id

action

entity_type

entity_id

timestamp

IP address where appropriate

metadata

---

# 28. SECURITY

Implement:

* HTTPS-ready configuration
* JWT authentication
* Password hashing
* Role-based access control
* Input validation
* SQL injection protection through Prisma/parameterized queries
* XSS protection
* CORS configuration
* Rate limiting
* Secure HTTP headers
* Request validation
* Error handling
* Database constraints
* Audit logging
* Environment variables
* No secrets in Git
* Automatic session expiration

Sensitive patient information must never appear in application logs.

---

# 29. API STRUCTURE

Create REST APIs.

Authentication:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/refresh

GET /api/auth/me

Patients:

GET /api/patients

POST /api/patients

GET /api/patients/:id

PUT /api/patients/:id

DELETE /api/patients/:id

Assessments:

GET /api/assessments

GET /api/assessments/:id

POST /api/assessments

PUT /api/assessments/:id

Assessment Sessions:

POST /api/sessions

GET /api/sessions/:id

PUT /api/sessions/:id

POST /api/sessions/:id/responses

POST /api/sessions/:id/complete

Scores:

POST /api/sessions/:id/score

GET /api/sessions/:id/scores

AI:

POST /api/sessions/:id/ai-analysis

GET /api/sessions/:id/ai-analysis

POST /api/ai-suggestions/:id/accept

POST /api/ai-suggestions/:id/modify

POST /api/ai-suggestions/:id/reject

Clinical Review:

GET /api/sessions/:id/review

POST /api/sessions/:id/review

PUT /api/sessions/:id/review

Reports:

POST /api/reports/:sessionId/generate

GET /api/reports/:id

GET /api/reports/:id/download

Follow-up:

GET /api/followups

POST /api/followups

PUT /api/followups/:id

---

# 30. FRONTEND PAGES

Create:

/login

/dashboard

/patients

/patients/:id

/patients/:id/assessments

/assessments

/assessments/:id

/sessions/:id

/sessions/:id/questions

/sessions/:id/results

/sessions/:id/ai-review

/sessions/:id/clinical-review

/reports

/reports/:id

/followups

/settings

/admin/users

/admin/assessments

/admin/audit-logs

---

# 31. UI DESIGN

Use the uploaded PSYSCAN blueprint as the primary visual reference.

Design characteristics:

* Professional clinical appearance
* Clean white background
* Dark blue primary color
* Light blue secondary panels
* Green success indicators
* Orange warning indicators
* Red risk indicators
* Purple psychologist review section
* Rounded cards
* Clear section headings
* Medical/clinical dashboard appearance
* Responsive design

Do NOT make the UI look like a gaming application.

Use icons and charts carefully.

---

# 32. MAIN DASHBOARD DESIGN

Top:

PSYSCAN AI

AI-Assisted Psychological Screening Application

Sidebar:

Dashboard

Patients

Assessments

Assessment Sessions

AI Screening

Clinical Review

Reports

Follow-up

Notifications

Settings

Admin

Bottom:

Logged-in user

Role

Logout

---

# 33. PATIENT PROFILE

Design patient profile as:

Patient Header

Patient Code

Age

Gender

Assigned Psychologist

Assessment Status

Risk Status

Tabs:

Overview

Demographics

Assessments

Scores

AI Screening

Clinical Review

Reports

Follow-up

Timeline

---

# 34. ASSESSMENT RESULT SCREEN

Display:

Assessment name

Assessment version

Date

Raw score

Subscale scores

Severity

Interpretation

Graph

Previous score comparison

Important:

Use clinically valid interpretation rules from the configured assessment version.

Do not let the AI invent scoring thresholds.

---

# 35. AI SCREENING SCREEN

Create a visually clear screen:

AI-Assisted Screening

Status:

Awaiting Clinical Review

Sections:

Symptom Pattern Recognition

Severity Observation

Risk Flags

Areas of Concern

Suggested Further Assessment

Suggested Referral

AI Summary

Each item must have:

[Accept]

[Modify]

[Reject]

The system should record the psychologist's decision.

---

# 36. CLINICAL REVIEW SCREEN

Split the page:

LEFT:

Assessment data

Scores

Charts

Patient factors

AI observations

RIGHT:

Clinical review form

Clinical observations

Risk assessment

Recommendations

Further assessment

Referral

Follow-up

Final clinical impression

Button:

SAVE DRAFT

FINALIZE CLINICAL REVIEW

Before finalization:

Show confirmation dialog:

"Finalizing this review records the clinician's current clinical judgment. Continue?"

---

# 37. REPORT PAGE

Provide:

View Report

Download PDF

Print

Report Version

Reviewed By

Date

Status

---

# 38. FOLLOW-UP SYSTEM

Allow psychologists to create:

Follow-up date

Follow-up type

Purpose

Assigned clinician

Notes

Status

Reminder

Statuses:

PENDING

SCHEDULED

COMPLETED

MISSED

CANCELLED

---

# 39. NOTIFICATION SYSTEM

Create notifications for:

* Assessment completed
* Assessment awaiting review
* High-priority risk review
* Follow-up due
* Report generated
* AI analysis completed

Notifications should not reveal sensitive clinical information in notification previews.

---

# 40. SEARCH AND FILTERING

Patients:

Search by:

* Patient code
* Name
* Assigned psychologist

Filter by:

* Assessment status
* Risk review status
* Date

Assessments:

Filter by:

* Domain
* Age group
* Active status

---

# 41. DEMO DATA

Create a seed script.

Use synthetic patients only.

Example:

Patient:

PSY-10001

Name:

Demo Patient

Do not use real patient information.

Create demo assessment definitions and sample questions clearly marked:

DEMO ONLY

Do not present demo scores as clinically valid.

---

# 42. DATABASE MIGRATION

Use Prisma migrations.

Commands should work:

npm install

npx prisma generate

npx prisma migrate dev

npx prisma db seed

npm run dev

Provide:

.env.example

---

# 43. ENVIRONMENT VARIABLES

Create:

DATABASE_URL

JWT_SECRET

JWT_REFRESH_SECRET

AI_PROVIDER

AI_API_KEY

AI_MODEL

PORT

FRONTEND_URL

CORS_ORIGIN

NODE_ENV

Never hard-code secrets.

---

# 44. ERROR HANDLING

Create centralized API error handling.

Return consistent responses:

{
"success": false,
"message": "Human readable error",
"errorCode": "ERROR_CODE"
}

For successful requests:

{
"success": true,
"data": {}
}

Never expose database stack traces to users.

---

# 45. VALIDATION

Use Zod on API inputs.

Validate:

* Patient fields
* Assessment responses
* User registration
* Login
* Clinical review
* Risk assessment
* Follow-up
* Report requests

---

# 46. RESPONSIVE DESIGN

The application must work on:

Desktop

Laptop

Tablet

Mobile

Clinical dashboard should prioritize desktop/tablet.

Assessment questionnaire should work well on mobile.

---

# 47. PERFORMANCE

Implement:

* Pagination
* Database indexes
* Lazy loading
* API caching where appropriate
* Efficient SQL queries
* React Query caching
* Debounced search

Create indexes for:

patient_code

email

assessment_id

patient_id

session_id

created_at

risk_level

status

---

# 48. AI SERVICE ARCHITECTURE

Create:

backend/src/ai/

```
ai.service.ts

ai.provider.ts

mock.provider.ts

openai.provider.ts

gemini.provider.ts
```

The application should use an interface:

AIProvider

Methods:

analyzeScreeningData()

generateScreeningSummary()

suggestFurtherAssessment()

generateFollowUpSuggestions()

The application should be able to switch providers without modifying the rest of the application.

---

# 49. AI PROMPT SAFETY

AI input should contain only the minimum required information.

Do not send:

Passwords

Authentication tokens

Unnecessary personally identifiable information

Do not include patient names if not necessary.

Prefer:

Patient ID

Age group

Assessment scores

Relevant factors

Clinical observations

The AI must be instructed:

"You are assisting a qualified clinician. Do not diagnose. Do not prescribe medication. Do not make autonomous treatment decisions. Identify screening patterns and uncertainty. Clearly distinguish questionnaire-derived results from AI-generated observations. Recommend professional review where appropriate."

---

# 50. AI OUTPUT JSON

AI should return structured output similar to:

{
"summary": "",
"symptom_patterns": [],
"severity_observations": [],
"areas_of_concern": [],
"risk_flags": [],
"further_assessments": [],
"referral_considerations": [],
"uncertainties": []
}

Validate this response before storing it.

Do not directly render arbitrary AI-generated HTML.

---

# 51. VERSION CONTROL FOR CLINICAL LOGIC

Every assessment must have a version.

Example:

PHQ-9

Version:

1.0

If scoring logic changes:

Create:

Version 1.1

Do not modify historical assessment results.

Historical reports must remain reproducible.

---

# 52. DATA RETENTION

Create configurable retention settings.

Do not permanently delete clinical records without appropriate authorization.

Support:

Archive

Soft Delete

Retention Policy

Data Export

Data Deletion Request

All destructive operations require authorization and audit logging.

---

# 53. BACKUP

Create documentation for:

MySQL backup

Database restore

Environment recovery

Recommended backup:

mysqldump

Provide example commands in README.

---

# 54. TESTING

Create tests for:

Authentication

RBAC

Patient CRUD

Assessment CRUD

Questionnaire responses

Scoring

Severity calculation

Risk flag generation

AI response validation

Clinical review

Report generation

Audit logging

Follow-up

API authorization

Important:

Test that an assessor cannot finalize a clinical impression.

Test that a patient cannot access another patient's data.

Test that rejected AI suggestions cannot silently become final clinical conclusions.

---

# 55. SECURITY TESTING

Test:

SQL injection

XSS

CSRF where applicable

Broken access control

JWT manipulation

Unauthorized patient access

Unauthorized report access

Sensitive data exposure

Rate limiting

Invalid questionnaire input

---

# 56. ACCESS CONTROL MATRIX

Implement permissions such as:

PATIENT_VIEW

PATIENT_CREATE

PATIENT_EDIT

ASSESSMENT_VIEW

ASSESSMENT_CREATE

ASSESSMENT_ADMIN

SESSION_CREATE

SESSION_EDIT

SESSION_COMPLETE

SCORE_VIEW

AI_ANALYSIS_VIEW

AI_ANALYSIS_RUN

AI_SUGGESTION_REVIEW

CLINICAL_REVIEW_CREATE

CLINICAL_REVIEW_FINALIZE

REPORT_GENERATE

REPORT_VIEW

REPORT_DOWNLOAD

FOLLOWUP_MANAGE

AUDIT_VIEW

USER_MANAGE

SYSTEM_SETTINGS

---

# 57. CLINICAL DISCLAIMER

Display this in the application footer and reports:

"PSYSCAN AI is intended for psychological screening and clinical decision support. It does not provide a medical or psychological diagnosis. AI-generated information is probabilistic and must be independently reviewed by a qualified mental health professional. Clinical decisions must be based on comprehensive professional assessment."

---

# 58. IMPORTANT UX RULE

Never display:

"AI Diagnosis"

Instead display:

"AI-Assisted Screening"

Never display:

"AI Diagnosed Condition"

Instead display:

"Screening Observation"

Never display:

"Treatment Generated by AI"

Instead display:

"Clinician Review / Recommendation"

---

# 59. DATABASE ADMINISTRATION

Include Prisma Studio support.

README should explain:

npx prisma studio

Also explain how to:

Create database

Run migrations

Seed database

Reset development database

Create backup

Restore backup

---

# 60. MYSQL DATABASE NAME

Use:

psyscan_ai

Example:

DATABASE_URL="mysql://root:password@localhost:3306/psyscan_ai"

Do not commit the real password.

---

# 61. DEVELOPMENT ENVIRONMENT

Create clear setup instructions.

Prerequisites:

Node.js

npm

MySQL 8+

Git

Optional:

Python 3.x for future AI service

Installation:

1. Clone project
2. Install frontend dependencies
3. Install backend dependencies
4. Create MySQL database
5. Configure .env
6. Run Prisma migration
7. Seed database
8. Start backend
9. Start frontend

---

# 62. RUN COMMANDS

Frontend:

npm run dev

Backend:

npm run dev

Database:

npx prisma migrate dev

Seed:

npx prisma db seed

Prisma:

npx prisma studio

Production build:

npm run build

---

# 63. README

Generate a complete README containing:

Project overview

Architecture

Technology stack

Folder structure

Installation

MySQL configuration

Environment variables

Prisma setup

Database migration

Seed database

Running frontend

Running backend

API documentation

Authentication

Role permissions

AI configuration

PDF reports

Testing

Security

Deployment

Backup

Troubleshooting

Clinical safety disclaimer

---

# 64. API DOCUMENTATION

Generate Swagger/OpenAPI documentation.

Route:

/api/docs

Document:

Authentication

Patients

Assessments

Sessions

Scores

AI

Clinical Review

Reports

Follow-ups

Users

Audit Logs

---

# 65. UI COMPONENTS

Create reusable components:

Button

Input

Select

Modal

Dialog

Table

Pagination

SearchBar

FilterPanel

StatusBadge

RiskBadge

ScoreCard

SeverityBadge

AssessmentCard

PatientCard

ProgressBar

ChartCard

AIInsightCard

ClinicalReviewPanel

ReportPreview

ConfirmationDialog

NotificationPanel

---

# 66. COLOR SYSTEM

Use a professional clinical palette.

Primary:

Dark Blue

Secondary:

Light Blue

Success:

Green

Warning:

Orange

Danger:

Red

AI:

Blue/Purple

Clinical Review:

Purple

Use colors consistently.

Do not use excessive gradients.

---

# 67. ACCESSIBILITY

Implement:

Keyboard navigation

ARIA labels

Readable contrast

Focus states

Screen-reader friendly forms

Large clickable controls

Accessible error messages

---

# 68. FINAL ARCHITECTURE

The final system should behave like:

```
                PSYSCAN AI
                     │
            ┌────────┴────────┐
            │                 │
         FRONTEND           API
         React             Express
            │                 │
            │          ┌──────┴──────┐
            │          │             │
            │       Scoring        AI Layer
            │          │             │
            └──────────┴──────┬──────┘
                               │
                            Prisma
                               │
                            MySQL
                               │
    ┌──────────────────────────┼────────────────────┐
    │                          │                    │
 Patients                 Assessments          Reports
    │                          │                    │
 History                  Responses             PDF
    │                          │
 Follow-up                  Scores
                               │
                          AI Analysis
                               │
                       Psychologist Review
                               │
                        Final Clinical
                           Impression
```

---

# 69. DEVELOPMENT PHASES

Build the project in phases.

## PHASE 1 – FOUNDATION

Create:

* React frontend
* Node backend
* MySQL
* Prisma
* Authentication
* RBAC
* Base dashboard

Make sure the application runs successfully.

## PHASE 2 – PATIENT MANAGEMENT

Implement:

* Patient CRUD
* Patient profile
* Search
* Filtering
* Patient history

## PHASE 3 – ASSESSMENT ENGINE

Implement:

* Assessment database
* Assessment versions
* Questions
* Responses
* Sessions
* Auto-save
* Scoring engine

## PHASE 4 – AI SCREENING

Implement:

* AI service abstraction
* Pattern recognition
* Screening summary
* Risk flagging
* Further assessment suggestions
* AI suggestion storage

## PHASE 5 – PSYCHOLOGIST REVIEW

Implement:

* Clinical review
* Accept
* Modify
* Reject
* Clinical observations
* Risk review
* Final clinical impression

## PHASE 6 – REPORTING

Implement:

* Screening profile
* Severity summary
* Risk summary
* Recommendations
* Referral
* PDF generation

## PHASE 7 – FOLLOW-UP

Implement:

* Follow-up plans
* Reminders
* Monitoring
* Patient timeline

## PHASE 8 – SECURITY & TESTING

Implement:

* RBAC testing
* Security testing
* Audit logs
* Validation
* Error handling
* Backup documentation

## PHASE 9 – FINAL UI POLISH

Match the provided blueprint.

Improve:

* Spacing
* Typography
* Icons
* Tables
* Charts
* Responsive design
* Accessibility

---

# 70. VERY IMPORTANT IMPLEMENTATION RULE

Do not attempt to build the entire application as one giant component.

Use:

Reusable components

Services

Controllers

Routes

Database models

Validation schemas

Business logic services

Scoring modules

AI provider abstraction

Report generation service

Audit service

---

# 71. FIRST DEVELOPMENT TASK

Before writing large amounts of code:

1. Analyze the complete requirements.
2. Create the architecture.
3. Create the folder structure.
4. Create Prisma schema.
5. Create MySQL database configuration.
6. Create migrations.
7. Create seed data.
8. Implement authentication.
9. Implement the base dashboard.
10. Start the application.
11. Verify frontend → backend → MySQL connection.
12. Then continue module by module.

After each major phase:

* Run the application
* Check database connectivity
* Test APIs
* Fix errors
* Do not leave broken imports
* Do not leave placeholder routes that are presented as completed features

---

# 72. SUCCESS CRITERIA

The project is considered successfully implemented only when:

* Frontend runs
* Backend runs
* MySQL connects
* Prisma migrations work
* Authentication works
* RBAC works
* Patients can be created
* Assessments can be assigned
* Assessment responses can be saved
* Scoring works deterministically
* AI analysis can be generated through the provider abstraction
* AI suggestions are stored
* Psychologist can accept/modify/reject suggestions
* Clinical review can be finalized
* PDF report can be generated
* Follow-up can be created
* Audit logs are recorded
* Unauthorized users cannot access protected patient data
* Demo data works
* README contains complete setup instructions
* No real patient data is included
* No proprietary questionnaire content is included without authorization
* The application clearly states that it is not a diagnostic tool

---

# 73. FINAL INSTRUCTION TO ANTIGRAVITY

Start by creating the complete project architecture and database schema.

Do not skip the database design.

Do not use localStorage as a replacement for MySQL.

Do not hard-code patient records.

Do not hard-code assessment results.

Do not hard-code AI suggestions.

All important application data must be stored in MySQL.

Use Prisma migrations for schema changes.

Use seed data only for development/demo purposes.

Build the application so that the assessment/questionnaire system is configurable and new authorized assessments can be added without rewriting the entire application.

Maintain strict separation between:

1. Questionnaire scoring
2. AI-assisted analysis
3. Clinical judgment

The deterministic scoring engine calculates official scores.

The AI analyzes already-calculated results and produces screening suggestions.

The psychologist makes the final clinical decision.

Build PSYSCAN AI as a professional, secure, scalable, database-driven clinical screening platform following the provided PSYSCAN blueprint.
## PRIMARY PSYCHOLOGIST

Configure the initial PSYSCAN AI system with the following psychologist account:

**Name:** Shalini Devi V
**Role:** PSYCHOLOGIST
**Access Level:** Clinical Reviewer

The psychologist account must have permission to:

* View assigned patients
* Conduct/view clinical interviews
* View completed assessments
* View questionnaire scores
* View AI-assisted screening results
* Review AI-generated suggestions
* Accept AI suggestions
* Modify AI suggestions
* Reject AI suggestions
* Add clinical observations
* Add clinical notes
* Review risk flags
* Add recommendations
* Suggest further assessments
* Create referral plans
* Create follow-up plans
* Add the final clinical impression
* Finalize clinical reviews
* Generate and download screening reports

### DEFAULT DEMO PSYCHOLOGIST

For the development/demo database seed, create:

```text
Name: Shalini Devi V
Role: PSYCHOLOGIST
Status: ACTIVE
```

Use a placeholder email in the seed data rather than inventing a real personal email address.

Example:

```text
shalini.devi@psyscan.local
```

The account must be changeable later from the Admin → Users section.

### PATIENT ASSIGNMENT

When creating a new patient in the demo environment, allow the administrator/authorized assessor to assign:

**Psychologist: Shalini Devi V**

The Patient Profile should display:

```text
Assigned Psychologist
Shalini Devi V
```

### CLINICAL REVIEW

On the Clinical Review page display:

```text
Clinical Reviewer
Shalini Devi V
```

When she finalizes a clinical review, store:

* Psychologist ID
* Psychologist name
* Review date/time
* Clinical observations
* Risk assessment
* Recommendations
* Final clinical impression
* Review status

The report should show:

```text
Reviewed By:
Shalini Devi V
Psychologist
```

Do not hard-code the psychologist name throughout the frontend. Store the psychologist as a `User` record in MySQL and reference the user's ID in patient assignments, clinical reviews, reports, and audit logs.
