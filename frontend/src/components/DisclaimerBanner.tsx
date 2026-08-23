import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact }) => {
  if (compact) {
    return (
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-lg p-2.5 flex items-center space-x-2 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Clinical Decision Support Notice:</strong> PSYSCAN AI is a screening tool. It does not provide medical diagnoses. Professional clinician review is required.
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 leading-relaxed">
          <h4 className="font-semibold text-blue-950 text-sm mb-0.5">
            PSYSCAN AI Clinical Screening & Decision-Support Notice
          </h4>
          <p>
            PSYSCAN AI is intended for psychological screening and clinical decision support. It does <strong>not</strong> provide a medical or psychological diagnosis. AI-generated information is probabilistic and must be independently reviewed by a qualified mental health professional. Clinical decisions must be based on comprehensive professional assessment.
          </p>
        </div>
      </div>
    </div>
  );
};
