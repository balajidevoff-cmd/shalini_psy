export type RoleType = 'ADMIN' | 'PSYCHOLOGIST' | 'ASSESSOR' | 'PATIENT';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED' | 'OTHER';

export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'DISCHARGED' | 'ARCHIVED';

export type SessionStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'UNDER_REVIEW' | 'REVIEWED' | 'FINALIZED' | 'ARCHIVED';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type AISuggestionType =
  | 'SYMPTOM_PATTERN'
  | 'SEVERITY_OBSERVATION'
  | 'RISK_FLAG'
  | 'AREA_OF_CONCERN'
  | 'FURTHER_ASSESSMENT'
  | 'REFERRAL_CONSIDERATION'
  | 'UNCERTAINTY_NOTE';

export type AISuggestionStatus = 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  title?: string | null;
  licenseNumber?: string | null;
  status: string;
  lastLoginAt?: string | null;
}

export interface PatientContact {
  id: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  emergencyName?: string | null;
  emergencyRelation?: string | null;
  emergencyPhone?: string | null;
}

export interface PatientHistory {
  id: string;
  presentingComplaints?: string | null;
  symptomDuration?: string | null;
  medicalHistory?: string | null;
  familyHistory?: string | null;
  traumaHistory?: string | null;
  majorLifeEvents?: string | null;
  suicidalThoughts: boolean;
  selfHarmHistory: boolean;
  substanceUse?: string | null;
  sleepPattern?: string | null;
}

export interface Patient {
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  gender: Gender;
  education?: string | null;
  occupation?: string | null;
  maritalStatus?: MaritalStatus | null;
  socioeconomicStatus?: string | null;
  status: PatientStatus;
  assignedPsychologistId?: string | null;
  assignedPsychologist?: User | null;
  contact?: PatientContact | null;
  history?: PatientHistory | null;
  createdAt: string;
  updatedAt: string;
  sessions?: AssessmentSession[];
  followUpPlans?: FollowUpPlan[];
  reports?: Report[];
}

export interface AssessmentDomain {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  _count?: { assessments: number };
}

export interface AssessmentOption {
  id: string;
  label: string;
  value: number;
  orderIndex: number;
}

export interface AssessmentQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  subscale?: string | null;
  required: boolean;
  isReverseScored: boolean;
  riskTriggerValue?: number | null;
  orderIndex: number;
  options: AssessmentOption[];
}

export interface AssessmentSeverityBand {
  id: string;
  minScore: number;
  maxScore: number;
  severityLabel: string;
  colorHex: string;
  clinicalDescription?: string | null;
  subscaleName?: string | null;
  orderIndex: number;
}

export interface AssessmentVersion {
  id: string;
  assessmentId: string;
  version: string;
  instructions?: string | null;
  isCurrent: boolean;
  questions?: AssessmentQuestion[];
  severityBands?: AssessmentSeverityBand[];
  _count?: { questions: number };
}

export interface Assessment {
  id: string;
  domainId: string;
  domain?: AssessmentDomain;
  name: string;
  shortName: string;
  description?: string | null;
  ageMin: number;
  ageMax: number;
  administrationType: string;
  licensingStatus: string;
  active: boolean;
  versions?: AssessmentVersion[];
}

export interface AssessmentResponse {
  id: string;
  questionId: string;
  responseValue: number;
  responseText?: string | null;
  question?: AssessmentQuestion;
}

export interface SubscaleScore {
  id: string;
  subscaleName: string;
  rawScore: number;
  maxScore: number;
  severity?: string | null;
  colorHex: string;
}

export interface AssessmentScore {
  id: string;
  rawScore: number;
  maxPossibleScore: number;
  standardScore?: number | null;
  percentile?: number | null;
  severity: string;
  severityColor: string;
  hasRiskFlag: boolean;
  riskFlagDetails?: string | null;
  interpretation: string;
  scoredAt: string;
  subscaleScores: SubscaleScore[];
}

export interface AISuggestion {
  id: string;
  suggestionType: AISuggestionType;
  title: string;
  content: string;
  confidenceLevel?: string | null;
  inputReferencesJson?: string | null;
  status: AISuggestionStatus;
  decisionComment?: string | null;
  modifiedContent?: string | null;
  decidedAt?: string | null;
  orderIndex: number;
}

export interface AIAnalysis {
  id: string;
  modelName: string;
  modelVersion: string;
  promptVersion: string;
  summary: string;
  riskObservation?: string | null;
  status: string;
  generatedAt: string;
  suggestions: AISuggestion[];
}

export interface ClinicalReview {
  id: string;
  sessionId: string;
  psychologistId: string;
  psychologist?: User;
  psychologistName: string;
  clinicalInterview?: string | null;
  clinicalObservations?: string | null;
  areasOfConcern?: string | null;
  riskLevel: RiskLevel;
  riskJustification?: string | null;
  recommendations?: string | null;
  furtherAssessments?: string | null;
  referralPlan?: string | null;
  followUpPlanNotes?: string | null;
  finalClinicalImpression?: string | null;
  status: 'DRAFT' | 'FINALIZED';
  reviewedAt?: string | null;
  createdAt: string;
}

export interface AssessmentSession {
  id: string;
  patientId: string;
  patient: Patient;
  assessmentId: string;
  assessment: Assessment;
  assessmentVersionId: string;
  assessmentVersion?: AssessmentVersion;
  status: SessionStatus;
  currentQuestionIndex: number;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  conductedBy?: User | null;
  responses?: AssessmentResponse[];
  score?: AssessmentScore | null;
  aiAnalysis?: AIAnalysis | null;
  clinicalReview?: ClinicalReview | null;
}

export interface Report {
  id: string;
  patientId: string;
  patient: Patient;
  sessionId: string;
  session?: AssessmentSession;
  reportNumber: string;
  title: string;
  version: number;
  reviewedByName: string;
  reviewedByRole: string;
  summaryJson?: string | null;
  generatedAt: string;
}

export interface FollowUpPlan {
  id: string;
  patientId: string;
  patient: Patient;
  assignedClinicianId?: string | null;
  assignedClinician?: User | null;
  scheduledDate: string;
  followUpType: string;
  purpose: string;
  notes?: string | null;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  reminderSent: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  user?: User | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  metadata?: string | null;
  timestamp: string;
}
