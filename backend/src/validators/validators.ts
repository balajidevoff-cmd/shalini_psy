import { z } from 'zod';

// Auth Validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['ADMIN', 'PSYCHOLOGIST', 'ASSESSOR', 'PATIENT']).default('PSYCHOLOGIST'),
  title: z.string().optional(),
  licenseNumber: z.string().optional(),
});

// Patient Validators
export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().or(z.date()),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  education: z.string().optional(),
  occupation: z.string().optional(),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED', 'OTHER']).optional(),
  socioeconomicStatus: z.string().optional(),
  assignedPsychologistId: z.string().optional(),
  // Contact
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyRelation: z.string().optional(),
  emergencyPhone: z.string().optional(),
  // History
  presentingComplaints: z.string().optional(),
  symptomDuration: z.string().optional(),
  medicalHistory: z.string().optional(),
  familyHistory: z.string().optional(),
  traumaHistory: z.string().optional(),
  majorLifeEvents: z.string().optional(),
  suicidalThoughts: z.boolean().optional(),
  selfHarmHistory: z.boolean().optional(),
  substanceUse: z.string().optional(),
  sleepPattern: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

// Session & Questionnaire Validators
export const createSessionSchema = z.object({
  patientId: z.string().uuid(),
  assessmentId: z.string(),
  assessmentVersionId: z.string().optional(),
  assignmentId: z.string().optional(),
});

export const submitResponsesSchema = z.object({
  responses: z.array(
    z.object({
      questionId: z.string(),
      responseValue: z.number().int().min(0),
      responseText: z.string().optional(),
    })
  ),
});

// AI Suggestion Decision Validator
export const aiSuggestionDecisionSchema = z.object({
  status: z.enum(['ACCEPTED', 'MODIFIED', 'REJECTED']),
  decisionComment: z.string().optional(),
  modifiedContent: z.string().optional(),
});

// Clinical Review Validator
export const clinicalReviewSchema = z.object({
  clinicalInterview: z.string().optional(),
  clinicalObservations: z.string().optional(),
  areasOfConcern: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MODERATE', 'HIGH']).default('LOW'),
  riskJustification: z.string().optional(),
  recommendations: z.string().optional(),
  furtherAssessments: z.string().or(z.array(z.string())).optional(),
  referralPlan: z.string().optional(),
  followUpPlanNotes: z.string().optional(),
  finalClinicalImpression: z.string().optional(),
  finalize: z.boolean().optional().default(false),
});

// Follow-up Plan Validator
export const createFollowUpSchema = z.object({
  patientId: z.string(),
  assignedClinicianId: z.string().optional(),
  scheduledDate: z.string().or(z.date()),
  followUpType: z.string().default('ROUTINE_SCREENING_REVIEW'),
  purpose: z.string().min(1, 'Purpose is required'),
  notes: z.string().optional(),
});
