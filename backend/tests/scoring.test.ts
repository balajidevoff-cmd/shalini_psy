import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DeterministicScoringEngine } from '../src/scoring/scoring.engine';
import { QuestionResponseData, ScoringRuleData, SeverityBandData } from '../src/scoring/scoring.types';

describe('Deterministic Scoring Engine Unit Tests', () => {
  it('should correctly calculate deterministic PHQ-9 score and severity band', () => {
    const responses: QuestionResponseData[] = [
      { questionId: '1', questionNumber: 1, responseValue: 2, subscale: 'Affective' },
      { questionId: '2', questionNumber: 2, responseValue: 2, subscale: 'Affective' },
      { questionId: '3', questionNumber: 3, responseValue: 2, subscale: 'Somatic' },
      { questionId: '4', questionNumber: 4, responseValue: 2, subscale: 'Somatic' },
      { questionId: '5', questionNumber: 5, responseValue: 1, subscale: 'Somatic' },
      { questionId: '6', questionNumber: 6, responseValue: 1, subscale: 'Cognitive' },
      { questionId: '7', questionNumber: 7, responseValue: 2, subscale: 'Cognitive' },
      { questionId: '8', questionNumber: 8, responseValue: 1, subscale: 'Somatic' },
      { questionId: '9', questionNumber: 9, responseValue: 0, subscale: 'Risk', riskTriggerValue: 1 },
    ];

    const rules: ScoringRuleData[] = [
      { scoringMethod: 'SUM', minScore: 0, maxScore: 27, cutoffScore: 10 },
    ];

    const bands: SeverityBandData[] = [
      { minScore: 0, maxScore: 4, severityLabel: 'Minimal or No Depression', colorHex: '#10B981', orderIndex: 1 },
      { minScore: 5, maxScore: 9, severityLabel: 'Mild Depressive Symptoms', colorHex: '#3B82F6', orderIndex: 2 },
      { minScore: 10, maxScore: 14, severityLabel: 'Moderate Depressive Symptoms', colorHex: '#F59E0B', orderIndex: 3 },
      { minScore: 15, maxScore: 19, severityLabel: 'Moderately Severe Depressive Symptoms', colorHex: '#F97316', orderIndex: 4 },
      { minScore: 20, maxScore: 27, severityLabel: 'Severe Depressive Symptoms', colorHex: '#EF4444', orderIndex: 5 },
    ];

    const result = DeterministicScoringEngine.calculate(
      responses,
      rules,
      bands,
      'Patient Health Questionnaire-9',
      'PHQ-9'
    );

    assert.strictEqual(result.rawScore, 13);
    assert.strictEqual(result.maxPossibleScore, 27);
    assert.strictEqual(result.severity, 'Moderate Depressive Symptoms');
    assert.strictEqual(result.hasRiskFlag, false);
    assert.ok(result.interpretation.includes('Moderate Depressive Symptoms'));
  });

  it('should flag high-priority risk alert when Item 9 is endorsed (score >= 1)', () => {
    const responses: QuestionResponseData[] = [
      { questionId: '1', questionNumber: 1, responseValue: 1 },
      { questionId: '2', questionNumber: 2, responseValue: 1 },
      { questionId: '3', questionNumber: 3, responseValue: 1 },
      { questionId: '4', questionNumber: 4, responseValue: 1 },
      { questionId: '5', questionNumber: 5, responseValue: 1 },
      { questionId: '6', questionNumber: 6, responseValue: 1 },
      { questionId: '7', questionNumber: 7, responseValue: 1 },
      { questionId: '8', questionNumber: 8, responseValue: 1 },
      { questionId: '9', questionNumber: 9, responseValue: 2, riskTriggerValue: 1 }, // High risk trigger!
    ];

    const rules: ScoringRuleData[] = [
      { scoringMethod: 'SUM', minScore: 0, maxScore: 27 },
    ];

    const bands: SeverityBandData[] = [
      { minScore: 0, maxScore: 9, severityLabel: 'Mild', colorHex: '#3B82F6', orderIndex: 1 },
      { minScore: 10, maxScore: 14, severityLabel: 'Moderate', colorHex: '#F59E0B', orderIndex: 2 },
    ];

    const result = DeterministicScoringEngine.calculate(
      responses,
      rules,
      bands,
      'PHQ-9',
      'PHQ-9'
    );

    assert.strictEqual(result.rawScore, 10);
    assert.strictEqual(result.hasRiskFlag, true);
    assert.ok(result.interpretation.includes('[HIGH PRIORITY RISK ALERT]'));
  });
});
