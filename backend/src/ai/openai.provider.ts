import { AIProvider } from './ai.provider';
import { AIScreeningInput, AIScreeningOutput } from './ai.types';
import { MockClinicalAIProvider } from './mock.provider';

export class OpenAIProvider implements AIProvider {
  public name = 'gpt-4o-mini';
  public version = '2024-07-18';
  private apiKey: string;
  private fallback: MockClinicalAIProvider;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fallback = new MockClinicalAIProvider();
  }

  public async analyzeScreeningData(input: AIScreeningInput): Promise<AIScreeningOutput> {
    if (!this.apiKey) {
      console.warn('⚠️ OpenAI API key not set. Using clinical heuristic fallback provider.');
      return this.fallback.analyzeScreeningData(input);
    }

    try {
      const prompt = `You are a clinical decision-support assistant for a licensed psychologist.
Strict Safety Rules:
1. Do NOT claim to diagnose any condition.
2. Do NOT prescribe medications or make autonomous medical decisions.
3. Use cautious clinical phrasing: "Screening results indicate elevated symptoms that may warrant further clinical evaluation."
4. Return pure JSON with structure: { "summary": "", "riskObservation": "", "symptomPatterns": [], "areasOfConcern": [], "furtherAssessments": [], "referralConsiderations": [], "uncertainties": [] }

Patient Data:
Age: ${input.age}, Gender: ${input.gender}
Assessment: ${input.assessmentName} (${input.shortName})
Score: ${input.rawScore} / ${input.maxScore} (Severity: ${input.severity})
Risk Flag: ${input.hasRiskFlag}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        return this.fallback.analyzeScreeningData(input);
      }

      const json: any = await response.json();
      const text = json.choices?.[0]?.message?.content;
      if (!text) return this.fallback.analyzeScreeningData(input);

      const parsed = JSON.parse(text);
      return {
        modelName: this.name,
        modelVersion: this.version,
        promptVersion: 'psyscan-openai-v1',
        summary: parsed.summary || this.fallback.generateScreeningSummary(input),
        riskObservation: parsed.riskObservation || 'Standard clinical review recommended.',
        suggestions: [
          {
            suggestionType: 'SYMPTOM_PATTERN',
            title: 'Symptom Pattern Observation',
            content: parsed.symptomPatterns?.[0] || 'Elevated symptom clusters observed.',
            confidenceLevel: 'HIGH',
          },
          {
            suggestionType: 'AREA_OF_CONCERN',
            title: 'Areas of Concern',
            content: parsed.areasOfConcern?.[0] || 'Occupational and emotional functioning.',
            confidenceLevel: 'MODERATE',
          },
        ],
        uncertainties: parsed.uncertainties || ['Probabilistic clinical screening data.'],
      };
    } catch (err) {
      console.error('OpenAI API call failed, using heuristic engine:', err);
      return this.fallback.analyzeScreeningData(input);
    }
  }

  public async generateScreeningSummary(input: AIScreeningInput): Promise<string> {
    return this.fallback.generateScreeningSummary(input);
  }

  public async suggestFurtherAssessment(input: AIScreeningInput): Promise<string[]> {
    return this.fallback.suggestFurtherAssessment(input);
  }

  public async generateFollowUpSuggestions(input: AIScreeningInput): Promise<string[]> {
    return this.fallback.generateFollowUpSuggestions(input);
  }
}
