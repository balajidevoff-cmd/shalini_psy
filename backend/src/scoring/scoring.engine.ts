import {
  QuestionResponseData,
  ScoringRuleData,
  SeverityBandData,
  ScoreCalculationResult,
  SubscaleCalculationResult,
} from './scoring.types';

export class DeterministicScoringEngine {
  /**
   * Computes the deterministic clinical questionnaire score, severity category,
   * subscale distributions, and risk flags without AI intervention.
   */
  public static calculate(
    responses: QuestionResponseData[],
    scoringRules: ScoringRuleData[],
    severityBands: SeverityBandData[],
    assessmentName: string,
    shortName: string
  ): ScoreCalculationResult {
    let rawTotalScore = 0;
    let hasRiskFlag = false;
    const riskFlagsList: string[] = [];

    // Group responses by subscale
    const subscaleSums: Record<string, { sum: number; count: number; maxScore: number }> = {};

    for (const resp of responses) {
      let val = resp.responseValue;

      // Handle reverse scored questions if configured
      if (resp.isReverseScored) {
        // Default 0-3 scale reverse: 3 - val; for custom scales, max can be passed
        val = Math.max(0, 3 - val);
      }

      rawTotalScore += val;

      // Check risk triggers (e.g. Suicidal ideation on PHQ-9 Q9)
      if (resp.riskTriggerValue !== null && resp.riskTriggerValue !== undefined) {
        if (val >= resp.riskTriggerValue) {
          hasRiskFlag = true;
          riskFlagsList.push(
            `Item #${resp.questionNumber} triggered high-risk threshold (Value: ${val} >= Threshold: ${resp.riskTriggerValue}).`
          );
        }
      }

      // Aggregate subscales
      const subscaleName = resp.subscale || 'General';
      if (!subscaleSums[subscaleName]) {
        subscaleSums[subscaleName] = { sum: 0, count: 0, maxScore: 0 };
      }
      subscaleSums[subscaleName].sum += val;
      subscaleSums[subscaleName].count += 1;
      subscaleSums[subscaleName].maxScore += 3; // Standard option ceiling
    }

    // Determine max possible score from rules or calculate from questions
    const primaryRule = scoringRules.find((r) => !r.subscaleName) || scoringRules[0];
    const maxPossibleScore = primaryRule ? primaryRule.maxScore : responses.length * 3;

    // Determine severity band
    const totalBands = severityBands
      .filter((b) => !b.subscaleName)
      .sort((a, b) => a.minScore - b.minScore);

    let matchingBand = totalBands.find(
      (b) => rawTotalScore >= b.minScore && rawTotalScore <= b.maxScore
    );

    if (!matchingBand && totalBands.length > 0) {
      if (rawTotalScore < totalBands[0].minScore) matchingBand = totalBands[0];
      else matchingBand = totalBands[totalBands.length - 1];
    }

    const severity = matchingBand ? matchingBand.severityLabel : 'Unspecified Severity';
    const severityColor = matchingBand ? matchingBand.colorHex : '#3B82F6';

    // Compute standard T-score or percentile approximation for standardized scales
    const standardScore = Math.round((50 + (rawTotalScore / (maxPossibleScore || 1)) * 30) * 10) / 10;
    const percentile = Math.min(
      99.9,
      Math.max(0.1, Math.round((rawTotalScore / (maxPossibleScore || 1)) * 95 * 10) / 10)
    );

    // Build Subscale Results
    const subscaleScores: SubscaleCalculationResult[] = Object.entries(subscaleSums).map(
      ([name, data]) => {
        const subRatio = data.sum / (data.maxScore || 1);
        let subSev = 'Mild';
        let subColor = '#10B981';

        if (subRatio >= 0.66) {
          subSev = 'Elevated';
          subColor = '#EF4444';
        } else if (subRatio >= 0.33) {
          subSev = 'Moderate';
          subColor = '#F59E0B';
        }

        return {
          subscaleName: name,
          rawScore: data.sum,
          maxScore: data.maxScore,
          severity: subSev,
          colorHex: subColor,
        };
      }
    );

    // Build deterministic clinical interpretation text
    let interpretation = `The respondent completed the ${assessmentName} (${shortName}) with a total raw score of ${rawTotalScore} out of ${maxPossibleScore} points. `;
    interpretation += `This score places the overall screening profile in the "${severity}" category. `;

    if (matchingBand?.clinicalDescription) {
      interpretation += `${matchingBand.clinicalDescription} `;
    }

    if (hasRiskFlag) {
      interpretation += `\n\n[HIGH PRIORITY RISK ALERT]: High-risk clinical responses were flagged during administration: ${riskFlagsList.join(
        ' '
      )} Immediate qualified clinician review is mandatory.`;
    }

    return {
      rawScore: rawTotalScore,
      maxPossibleScore,
      standardScore,
      percentile,
      severity,
      severityColor,
      hasRiskFlag,
      riskFlagDetails: hasRiskFlag ? riskFlagsList.join(' | ') : undefined,
      interpretation: interpretation.trim(),
      subscaleScores,
    };
  }
}
