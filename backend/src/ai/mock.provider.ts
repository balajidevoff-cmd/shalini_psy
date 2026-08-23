import { AIProvider } from './ai.provider';
import { AIScreeningInput, AIScreeningOutput, AISuggestionOutputItem } from './ai.types';

export class MockClinicalAIProvider implements AIProvider {
  public name = 'psyscan-clinical-decision-engine';
  public version = '1.3.0-heuristics';

  public async analyzeScreeningData(input: AIScreeningInput): Promise<AIScreeningOutput> {
    const suggestions: AISuggestionOutputItem[] = [];
    const uncertainties: string[] = [];

    const isElevated = input.rawScore >= input.maxScore * 0.4;
    const isSevere = input.rawScore >= input.maxScore * 0.7;

    // 1. Symptom Pattern Recognition
    let patternTitle = 'Somatic & Cognitive Symptom Clustering';
    let patternContent = `Screening indicates a concentrated cluster of symptoms on the ${input.assessmentName}. Reported severity corresponds to the ${input.severity} range.`;

    if (input.shortName.includes('PHQ')) {
      patternTitle = 'Affective-Somatic Dysregulation Pattern';
      patternContent = `Elevated scores across sleep disruption, fatigue, and mood items suggest a vegetative depressive symptom cluster frequently linked with occupational stress and circadian irregularity.`;
    } else if (input.shortName.includes('GAD')) {
      patternTitle = 'Autonomic & Generalized Apprehension Pattern';
      patternContent = `Elevated worry and restlessness indicators suggest heightened physiological arousal and cognitive worry cycles requiring cognitive-behavioral appraisal.`;
    } else if (input.shortName.includes('ISI')) {
      patternTitle = 'Sleep Maintenance & Daytime Impairment Cluster';
      patternContent = `Patient reports difficulty sustaining sleep architecture, resulting in secondary daytime cognitive fatigue.`;
    }

    suggestions.push({
      suggestionType: 'SYMPTOM_PATTERN',
      title: patternTitle,
      content: patternContent,
      confidenceLevel: 'HIGH',
      inputReferences: [`Assessment: ${input.shortName}`, `Score: ${input.rawScore}/${input.maxScore}`],
    });

    // 2. Severity Observation
    suggestions.push({
      suggestionType: 'SEVERITY_OBSERVATION',
      title: `Estimated Screening Severity: ${input.severity}`,
      content: `The deterministic score of ${input.rawScore}/${input.maxScore} corresponds to ${input.severity}. This observation reflects screening responses and requires clinical integration with intake interview data.`,
      confidenceLevel: 'HIGH',
      inputReferences: [`Deterministic Band: ${input.severity}`],
    });

    // 3. Risk Flag Observation
    if (input.hasRiskFlag || input.suicidalThoughts || input.selfHarmHistory) {
      suggestions.push({
        suggestionType: 'RISK_FLAG',
        title: 'HIGH PRIORITY CLINICAL REVIEW REQUIRED',
        content: `Specific items flagged potential risk factors: ${input.riskFlagDetails || 'Self-harm or acute distress indicators endorsed'}. Immediate clinician safety evaluation and structured risk assessment protocol recommended.`,
        confidenceLevel: 'HIGH',
        inputReferences: [input.riskFlagDetails || 'Risk triggers'],
      });
    } else {
      suggestions.push({
        suggestionType: 'RISK_FLAG',
        title: 'Low Acute Screening Risk Flag',
        content: 'No acute suicidal ideation or self-harm triggers were endorsed on the administered questionnaire items. Routine clinical monitoring is advised.',
        confidenceLevel: 'MODERATE',
        inputReferences: ['Zero risk trigger values endorsed on questionnaire'],
      });
    }

    // 4. Areas of Concern
    suggestions.push({
      suggestionType: 'AREA_OF_CONCERN',
      title: 'Psychosocial Stress & Daily Functioning',
      content: `Presenting complaints (${input.presentingComplaints || 'stress and mood variability'}) combined with screening results indicate potential functional interference in daily and occupational domains.`,
      confidenceLevel: 'MODERATE',
      inputReferences: ['Intake complaints & score profile'],
    });

    // 5. Suggested Further Assessments
    const furtherAssessmentsList: string[] = [];
    if (input.shortName.includes('PHQ')) {
      furtherAssessmentsList.push('GAD-7 (Generalized Anxiety Disorder-7)');
      furtherAssessmentsList.push('Insomnia Severity Index (ISI)');
      furtherAssessmentsList.push('Perceived Stress Scale (PSS-10)');
    } else if (input.shortName.includes('GAD')) {
      furtherAssessmentsList.push('PHQ-9 (Patient Health Questionnaire-9)');
      furtherAssessmentsList.push('Beck Anxiety Inventory (BAI Demo)');
    } else {
      furtherAssessmentsList.push('PHQ-9');
      furtherAssessmentsList.push('GAD-7');
    }

    suggestions.push({
      suggestionType: 'FURTHER_ASSESSMENT',
      title: 'Recommended Secondary Screenings',
      content: `Consider administering: ${furtherAssessmentsList.join(', ')} to evaluate comorbid symptom dimensions.`,
      confidenceLevel: 'HIGH',
      inputReferences: ['Comorbidity screening protocol'],
    });

    // 6. Referral Considerations
    if (isSevere) {
      suggestions.push({
        suggestionType: 'REFERRAL_CONSIDERATION',
        title: 'Consider Multidisciplinary Medical / Psychiatric Consultation',
        content: 'Elevated symptom severity may warrant collaborative consultation with a psychiatrist or medical practitioner alongside evidence-based psychotherapy.',
        confidenceLevel: 'MODERATE',
        inputReferences: ['Severe severity band score'],
      });
    } else if (isElevated) {
      suggestions.push({
        suggestionType: 'REFERRAL_CONSIDERATION',
        title: 'Outpatient Cognitive Behavioral Psychotherapy',
        content: 'Consider referral or enrollment into structured outpatient psychological interventions (e.g. CBT, mindfulness-based stress reduction).',
        confidenceLevel: 'HIGH',
        inputReferences: ['Moderate severity band score'],
      });
    }

    // 7. Uncertainty Notes
    uncertainties.push(
      'Self-report screening questionnaires are subject to self-presentation bias and state-dependent fluctuations.'
    );
    uncertainties.push(
      'AI-assisted pattern recognition is probabilistic and does not replace longitudinal clinical interview data.'
    );

    const summary = `Screening results for ${input.patientCode} on the ${input.assessmentName} indicate elevated symptoms (${input.severity}) with notable impact on emotional and cognitive functioning. Clinical decision-support algorithms flag potential benefit from targeted cognitive-behavioral interventions and comorbidity screening.`;

    const riskObservation = input.hasRiskFlag
      ? 'Elevated risk parameters identified on self-report. Prioritized psychologist interview recommended.'
      : 'Standard screening risk level observed. Continue ongoing clinical vigilance.';

    return {
      modelName: this.name,
      modelVersion: this.version,
      promptVersion: 'psyscan-screening-v2',
      summary,
      riskObservation,
      suggestions,
      uncertainties,
    };
  }

  public async generateScreeningSummary(input: AIScreeningInput): Promise<string> {
    return `Patient ${input.patientCode} obtained a score of ${input.rawScore}/${input.maxScore} (${input.severity}) on the ${input.assessmentName}. Symptoms suggest elevated stress and affective variability requiring clinician review.`;
  }

  public async suggestFurtherAssessment(input: AIScreeningInput): Promise<string[]> {
    return ['GAD-7', 'Insomnia Severity Index (ISI)', 'Perceived Stress Scale (PSS-10)'];
  }

  public async generateFollowUpSuggestions(input: AIScreeningInput): Promise<string[]> {
    return [
      'Schedule follow-up psychotherapy session in 1-2 weeks.',
      'Review daily sleep and activity monitoring log.',
      'Re-administer screening questionnaire in 4-6 weeks to track symptom trajectories.',
    ];
  }
}
