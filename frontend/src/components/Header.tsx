import React from 'react';
import { Stethoscope, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC<{ title?: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
      <div>
        {title && <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>}
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      {/* Active Clinician Snapshot */}
      <div className="flex items-center space-x-4">
        <div className="hidden sm:flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-3 py-1.5 rounded-lg">
          <Stethoscope className="w-4 h-4 text-blue-700" />
          <div className="text-left text-xs">
            <span className="text-slate-500 font-medium mr-1">Active Clinician:</span>
            <span className="font-bold text-blue-950">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          <span>Decision Support Active</span>
        </div>
      </div>
    </header>
  );
};
