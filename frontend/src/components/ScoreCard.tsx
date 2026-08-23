import React from 'react';
import { AssessmentScore } from '../types';
import { ShieldAlert, BarChart3 } from 'lucide-react';

export const ScoreCard: React.FC<{ score: AssessmentScore; assessmentName?: string }> = ({
  score,
  assessmentName,
}) => {
  const percentage = Math.round((score.rawScore / (score.maxPossibleScore || 1)) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Deterministic Scoring Result
          </span>
          <h3 className="text-lg font-bold text-slate-900">{assessmentName || 'Screening Score'}</h3>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
          style={{ backgroundColor: score.severityColor || '#3B82F6' }}
        >
          {score.severity}
        </div>
      </div>

      {/* Main Score Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center">
          <span className="text-xs font-medium text-slate-500 block mb-1">Total Raw Score</span>
          <span className="text-2xl font-extrabold text-slate-900">
            {score.rawScore} <span className="text-sm font-normal text-slate-400">/ {score.maxPossibleScore}</span>
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center">
          <span className="text-xs font-medium text-slate-500 block mb-1">Percentile Rank</span>
          <span className="text-2xl font-extrabold text-blue-700">{score.percentile ?? '—'}%</span>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-center">
          <span className="text-xs font-medium text-slate-500 block mb-1">Standard T-Score</span>
          <span className="text-2xl font-extrabold text-indigo-700">{score.standardScore ?? '—'}</span>
        </div>
      </div>

      {/* Visual Severity Progress Meter */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
          <span>Screening Severity Gauge</span>
          <span>{percentage}% of maximum possible score</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          <div
            className="h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${percentage}%`, backgroundColor: score.severityColor || '#3B82F6' }}
          />
        </div>
      </div>

      {/* Risk Flag Alert if present */}
      {score.hasRiskFlag && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start space-x-2.5 mb-4 text-xs text-red-900">
          <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-red-800">High-Priority Screening Risk Flag:</strong>
            <p className="mt-0.5 text-red-700">{score.riskFlagDetails || 'Acute risk item endorsed.'}</p>
          </div>
        </div>
      )}

      {/* Clinical Interpretation text */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3.5 text-xs text-slate-700 leading-relaxed">
        <h4 className="font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          Deterministic Rule Interpretation
        </h4>
        <p>{score.interpretation}</p>
      </div>
    </div>
  );
};
