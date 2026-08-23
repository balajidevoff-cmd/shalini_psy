export interface QuestionResponseData {
  questionId: string;
  questionNumber: number;
  responseValue: number;
  subscale?: string | null;
  isReverseScored?: boolean;
  riskTriggerValue?: number | null;
}

export interface ScoringRuleData {
  scoringMethod: 'SUM' | 'WEIGHTED_SUM' | 'AVERAGE' | 'PERCENTILE_RANK';
  minScore: number;
  maxScore: number;
  cutoffScore?: number | null;
  subscaleName?: string | null;
  ruleJson?: string | null;
}

export interface SeverityBandData {
  minScore: number;
  maxScore: number;
  severityLabel: string;
  colorHex: string;
  clinicalDescription?: string | null;
  subscaleName?: string | null;
}

export interface SubscaleCalculationResult {
  subscaleName: string;
  rawScore: number;
  maxScore: number;
  severity?: string;
  colorHex: string;
}

export interface ScoreCalculationResult {
  rawScore: number;
  maxPossibleScore: number;
  standardScore?: number;
  percentile?: number;
  severity: string;
  severityColor: string;
  hasRiskFlag: boolean;
  riskFlagDetails?: string;
  interpretation: string;
  subscaleScores: SubscaleCalculationResult[];
}
