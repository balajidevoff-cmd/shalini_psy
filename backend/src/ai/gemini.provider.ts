import { AIProvider } from './ai.provider';
import { AIScreeningInput, AIScreeningOutput } from './ai.types';
import { MockClinicalAIProvider } from './mock.provider';

export class GeminiAIProvider implements AIProvider {
  public name = 'gemini-1.5-flash';
  public version = '1.5.0';
  private apiKey: string;
  private fallback: MockClinicalAIProvider;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.fallback = new MockClinicalAIProvider();
  }

  public async analyzeScreeningData(input: AIScreeningInput): Promise<AIScreeningOutput> {
    if (!this.apiKey) {
      console.warn('⚠️ Gemini API key not set. Using clinical heuristic fallback provider.');
      return this.fallback.analyzeScreeningData(input);
    }

    try {
      // Build safe de-identified clinical decision prompt
      const prompt = `You are a clinical decision-support assistant for a licensed psychologist.
Strict Safety Rules:
1. Do NOT claim to diagnose any condition.
2. Do NOT prescribe medications or make autonomous medical decisions.
3. Use cautious clinical phrasing: "Screening results indicate elevated symptoms that may warrant further clinical evaluation."
4. Provide structured JSON with keys: summary, riskObservation, symptomPatterns, areasOfConcern, furtherAssessments, referralConsiderations, uncertainties.

Patient Clinical Data (De-identified):
Age: ${input.age}, Gender: ${input.gender}
Assessment: ${input.assessmentName} (${input.shortName})
Deterministic Score: ${input.rawScore} / ${input.maxScore} (Severity: ${input.severity})
Risk Flag Triggered: ${input.hasRiskFlag} (${input.riskFlagDetails || 'None'})
Presenting Complaints: ${input.presentingComplaints || 'N/A'}
Symptom Duration: ${input.symptomDuration || 'N/A'}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error('Gemini API returned error:', await response.text());
        return this.fallback.analyzeScreeningData(input);
      }

      const json: any = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return this.fallback.analyzeScreeningData(input);

      const parsed = JSON.parse(text);
      return {
        modelName: this.name,
        modelVersion: this.version,
        promptVersion: 'psyscan-gemini-v1',
        summary: parsed.summary || parsed.screeningSummary || this.fallback.generateScreeningSummary(input),
        riskObservation: parsed.riskObservation || 'Review clinical interview notes.',
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
          {
            suggestionType: 'FURTHER_ASSESSMENT',
            title: 'Suggested Secondary Screening',
            content: Array.isArray(parsed.furtherAssessments)
              ? parsed.furtherAssessments.join(', ')
              : 'GAD-7, ISI',
            confidenceLevel: 'HIGH',
          },
          {
            suggestionType: 'REFERRAL_CONSIDERATION',
            title: 'Intervention Consideration',
            content: parsed.referralConsiderations?.[0] || 'Consider outpatient psychotherapy (CBT).',
            confidenceLevel: 'MODERATE',
          },
        ],
        uncertainties: parsed.uncertainties || [
          'Screening tool requires clinical integration by a qualified mental health clinician.',
        ],
      };
    } catch (err) {
      console.error('Gemini API call failed, falling back to heuristic engine:', err);
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
