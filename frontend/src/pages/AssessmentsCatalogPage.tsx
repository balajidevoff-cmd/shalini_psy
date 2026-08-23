import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Assessment, AssessmentDomain } from '../types';
import { ClipboardList, PlayCircle, BookOpen, Layers, ShieldCheck } from 'lucide-react';

export const AssessmentsCatalogPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [domains, setDomains] = useState<AssessmentDomain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [asmtRes, domRes] = await Promise.all([
          api.get('/assessments', { params: { domainId: selectedDomain || undefined } }),
          api.get('/assessments/domains'),
        ]);
        if (asmtRes.data.success) setAssessments(asmtRes.data.data);
        if (domRes.data.success) setDomains(domRes.data.data);
      } catch (err) {
        console.error('Failed to load assessment library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedDomain]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Standardized Assessment Scales</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Authorized psychological screening instruments with version-controlled deterministic scoring engines.
          </p>
        </div>
        <Link to="/sessions/new" className="btn-primary text-xs">
          <PlayCircle className="w-4 h-4 mr-1.5" />
          Administer Screening
        </Link>
      </div>

      {/* Domain Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedDomain('')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            selectedDomain === ''
              ? 'bg-blue-700 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Domains
        </button>
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDomain(d.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedDomain === d.id
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {d.name} ({d._count?.assessments || 0})
          </button>
        ))}
      </div>

      {/* Assessments Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading assessments catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((a) => {
            const currentVersion = a.versions?.[0];
            return (
              <div
                key={a.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card hover:shadow-clinical transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-md">
                      {a.shortName}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                      {a.domain?.name}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{a.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed">
                    {a.description || 'Standardized psychological screening scale.'}
                  </p>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600 mb-5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Age Range:</span>
                      <span className="font-semibold text-slate-800">{a.ageMin} – {a.ageMax} yrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Administration:</span>
                      <span className="font-semibold text-slate-800">{a.administrationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Version / Items:</span>
                      <span className="font-semibold text-slate-800">
                        v{currentVersion?.version || '1.0'} ({currentVersion?._count?.questions || 9} Items)
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/sessions/new?assessmentId=${a.id}`}
                  className="btn-primary w-full text-xs justify-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Start Screening Session
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
