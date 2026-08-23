import { AIScreeningInput, AIScreeningOutput } from './ai.types';

export interface AIProvider {
  name: string;
  version: string;
  analyzeScreeningData(input: AIScreeningInput): Promise<AIScreeningOutput>;
  generateScreeningSummary(input: AIScreeningInput): Promise<string>;
  suggestFurtherAssessment(input: AIScreeningInput): Promise<string[]>;
  generateFollowUpSuggestions(input: AIScreeningInput): Promise<string[]>;
}
