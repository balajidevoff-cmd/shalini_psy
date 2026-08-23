export interface AIScreeningInput {
  patientCode: string;
  age: number;
  gender: string;
  education?: string | null;
  occupation?: string | null;
  presentingComplaints?: string | null;
  symptomDuration?: string | null;
  medicalHistory?: string | null;
  familyHistory?: string | null;
  traumaHistory?: string | null;
  suicidalThoughts?: boolean;
  selfHarmHistory?: boolean;
  substanceUse?: string | null;
  assessmentName: string;
  shortName: string;
  rawScore: number;
  maxScore: number;
  severity: string;
  hasRiskFlag: boolean;
  riskFlagDetails?: string;
  subscales: Array<{
    subscaleName: string;
    rawScore: number;
    maxScore: number;
    severity?: string;
  }>;
}

export interface AISuggestionOutputItem {
  suggestionType:
    | 'SYMPTOM_PATTERN'
    | 'SEVERITY_OBSERVATION'
    | 'RISK_FLAG'
    | 'AREA_OF_CONCERN'
    | 'FURTHER_ASSESSMENT'
    | 'REFERRAL_CONSIDERATION'
    | 'UNCERTAINTY_NOTE';
  title: string;
  content: string;
  confidenceLevel: 'LOW' | 'MODERATE' | 'HIGH';
  inputReferences?: string[];
}

export interface AIScreeningOutput {
  modelName: string;
  modelVersion: string;
  promptVersion: string;
  summary: string;
  riskObservation: string;
  suggestions: AISuggestionOutputItem[];
  uncertainties: string[];
}
