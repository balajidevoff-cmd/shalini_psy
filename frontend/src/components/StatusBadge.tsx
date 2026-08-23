import React from 'react';

export const RiskBadge: React.FC<{ level: 'LOW' | 'MODERATE' | 'HIGH' | string }> = ({ level }) => {
  const norm = level?.toUpperCase();
  if (norm === 'HIGH') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5"></span>
        HIGH RISK
      </span>
    );
  }
  if (norm === 'MODERATE') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        MODERATE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
      LOW RISK
    </span>
  );
};

export const SessionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; bg: string; text: string; border: string }> = {
    DRAFT: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    COMPLETED: { label: 'Completed', bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    UNDER_REVIEW: { label: 'Awaiting Review', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    REVIEWED: { label: 'Reviewed', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    FINALIZED: { label: 'Finalized', bg: 'bg-teal-100', text: 'text-teal-900', border: 'border-teal-300' },
  };

  const style = map[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
};
