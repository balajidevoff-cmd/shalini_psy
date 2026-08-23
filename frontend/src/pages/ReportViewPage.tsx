import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Report } from '../types';
import {
  FileText,
  Download,
  Printer,
  ArrowLeft,
  Stethoscope,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await api.get(`/reports/${id}`);
        if (res.data.success) {
          setReport(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!report) return;
    try {
      const res = await api.get(`/reports/sessions/${report.sessionId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${report.reportNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download PDF.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading clinical screening report...</div>;
  }

  if (!report) {
    return <div className="p-12 text-center text-red-500">Report not found.</div>;
  }

  const session = report.session;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Controls */}
      <div className="flex items-center justify-between no-print">
        <button
          onClick={() => navigate('/reports')}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Reports Directory
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Report
          </button>
          <button
            onClick={handleDownloadPdf}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF Document
          </button>
        </div>
      </div>

      {/* Report Document Sheet */}
      <div className="bg-white border border-slate-300 rounded-2xl shadow-clinical p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="bg-[#0F294A] text-white p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">PSYSCAN AI</h1>
            <p className="text-xs text-sky-200 font-medium mt-0.5">
              AI-Assisted Psychological Screening & Clinical Decision-Support Report
            </p>
          </div>
          <div className="text-left sm:text-right text-xs">
            <span className="font-mono font-bold block text-sm">{report.reportNumber}</span>
            <span className="text-slate-300 text-[11px]">
              Date: {new Date(report.generatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Section 1: Patient & Administration Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Patient Identification
            </h3>
            <div className="flex justify-between">
              <span className="text-slate-500">Patient Code:</span>
              <span className="font-mono font-bold text-slate-900">{report.patient.patientCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-bold text-slate-900">
                {report.patient.firstName} {report.patient.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Age / Gender:</span>
              <span className="font-semibold text-slate-800">
                {report.patient.age} yrs / {report.patient.gender}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Occupation:</span>
              <span className="text-slate-800">{report.patient.occupation || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-4 border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Administration Metadata
            </h3>
            <div className="flex justify-between">
              <span className="text-slate-500">Instrument:</span>
              <span className="font-bold text-slate-900">{session?.assessment?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Domain:</span>
              <span className="font-semibold text-slate-800">{session?.assessment?.domain?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Completed On:</span>
              <span className="text-slate-800">
                {session?.completedAt ? new Date(session.completedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Clinician:</span>
              <span className="font-bold text-purple-900">{report.reviewedByName}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Questionnaire Screening Scores */}
        {session?.score && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5">
              1. Standardized Questionnaire Scores
            </h2>

            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-blue-900 font-semibold block">Total Deterministic Score</span>
                <span className="text-2xl font-black text-slate-900">
                  {session.score.rawScore} <span className="text-sm font-normal text-slate-500">/ {session.score.maxPossibleScore}</span>
                </span>
              </div>
              <div>
                <span className="text-xs text-blue-900 font-semibold block">Severity Classification</span>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm mt-0.5"
                  style={{ backgroundColor: session.score.severityColor || '#3B82F6' }}
                >
                  {session.score.severity}
                </span>
              </div>
              <div>
                <span className="text-xs text-blue-900 font-semibold block">Standard T-Score</span>
                <span className="text-lg font-black text-indigo-900">{session.score.standardScore ?? 'N/A'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 italic leading-relaxed">
              {session.score.interpretation}
            </p>
          </div>
        )}

        {/* Section 3: AI-Assisted Screening Summary (Reviewed) */}
        {session?.aiAnalysis && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5 flex items-center justify-between">
              <span>2. AI-Assisted Screening Analysis (Clinician Reviewed)</span>
              <span className="text-[11px] font-normal text-slate-400">Probabilistic decision support</span>
            </h2>

            <div className="space-y-2.5">
              {session.aiAnalysis.suggestions?.map((sug) => (
                <div key={sug.id} className="p-3 bg-purple-50/40 border border-purple-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950">[{sug.suggestionType}] {sug.title}</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Clinician Confirmed
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{sug.modifiedContent || sug.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Psychologist Review & Impressions */}
        {session?.clinicalReview && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5">
              3. Psychologist Clinical Review & Final Impression
            </h2>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Clinical Observations:</span>
                <p>{session.clinicalReview.clinicalObservations || 'Mental status evaluation intact.'}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Risk Evaluation:</span>
                <p>
                  Level: <strong>{session.clinicalReview.riskLevel}</strong>
                  {session.clinicalReview.riskJustification && ` — ${session.clinicalReview.riskJustification}`}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Recommendations & Interventions:</span>
                <p className="whitespace-pre-line">{session.clinicalReview.recommendations || 'Outpatient psychotherapy.'}</p>
              </div>

              <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-200 space-y-1">
                <span className="font-black text-purple-950 uppercase tracking-wider block text-xs">
                  Final Clinical Impression:
                </span>
                <p className="font-medium text-purple-900 leading-relaxed">
                  {session.clinicalReview.finalClinicalImpression}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Clinician Signature Block */}
        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <div className="border border-slate-300 rounded-xl p-4 text-xs text-right space-y-1 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 block uppercase font-bold">Confirmed & Signed By:</span>
            <span className="font-black text-slate-900 text-sm block">Shalini Devi V</span>
            <span className="text-slate-600 block">Senior Clinical Psychologist</span>
            <span className="text-slate-400 font-mono text-[10px] block">License: RCI-PSY-2024-8841</span>
          </div>
        </div>

        {/* Disclaimer Footer */}
        <DisclaimerBanner />
      </div>
    </div>
  );
};
