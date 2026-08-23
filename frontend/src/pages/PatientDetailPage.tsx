import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Patient } from '../types';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileCheck2,
  Stethoscope,
  FileText,
  Clock,
  ArrowLeft,
  PlusCircle,
  ShieldCheck,
  AlertTriangle,
  History,
} from 'lucide-react';
import { RiskBadge, SessionStatusBadge } from '../components/StatusBadge';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'demographics' | 'history' | 'assessments' | 'reports' | 'followup'
  >('overview');

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await api.get(`/patients/${id}`);
        if (res.data.success) {
          setPatient(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load patient:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading patient profile...</div>;
  }

  if (!patient) {
    return <div className="p-12 text-center text-red-500">Patient not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Profile Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/patients')}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-blue-700 text-white flex items-center justify-center font-black text-xl shadow-md">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">
                  {patient.firstName} {patient.lastName}
                </h1>
                <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-md">
                  {patient.patientCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {patient.age} yrs • {patient.gender} • {patient.occupation || 'Occupation N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to={`/sessions/new?patientId=${patient.id}`}
              className="btn-primary text-xs"
            >
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Assign New Assessment
            </Link>
          </div>
        </div>

        {/* Clinician & Status Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl">
            <span className="text-[11px] text-purple-700 font-medium block mb-0.5">Assigned Psychologist</span>
            <span className="font-bold text-purple-950 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
              {patient.assignedPsychologist?.firstName || 'Shalini Devi'} {patient.assignedPsychologist?.lastName || 'V'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Patient Status</span>
            <span className="font-bold text-emerald-700">{patient.status}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Total Assessments</span>
            <span className="font-bold text-slate-900">{patient.sessions?.length || 0} Sessions</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[11px] text-slate-500 font-medium block mb-0.5">Follow-up Plans</span>
            <span className="font-bold text-blue-700">{patient.followUpPlans?.length || 0} Scheduled</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex space-x-2 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'demographics', label: 'Demographics & Contact' },
          { key: 'history', label: 'Clinical Factors & History' },
          { key: 'assessments', label: `Assessments (${patient.sessions?.length || 0})` },
          { key: 'reports', label: `Reports (${patient.reports?.length || 0})` },
          { key: 'followup', label: `Follow-up (${patient.followUpPlans?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-2.5 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-700 text-blue-700 font-bold bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Latest Assessment Results */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Latest Assessment Session</span>
              <FileCheck2 className="w-4 h-4 text-blue-600" />
            </h3>

            {patient.sessions && patient.sessions.length > 0 ? (
              (() => {
                const s = patient.sessions[0];
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{s.assessment.name}</h4>
                        <span className="text-xs text-slate-400 font-mono">{s.assessment.shortName}</span>
                      </div>
                      <SessionStatusBadge status={s.status} />
                    </div>

                    {s.score && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500 font-medium">Deterministic Score:</span>
                          <span className="font-bold text-slate-900">{s.score.rawScore} / {s.score.maxPossibleScore}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-500 font-medium">Severity Classification:</span>
                          <span className="font-bold text-amber-700">{s.score.severity}</span>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">{s.score.interpretation}</p>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-3">
                      <Link to={`/sessions/${s.id}/results`} className="btn-secondary text-xs flex-1 text-center">
                        View Scores
                      </Link>
                      <Link to={`/sessions/${s.id}/clinical-review`} className="btn-purple text-xs flex-1 text-center">
                        Clinical Review
                      </Link>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-slate-400 italic">No assessments conducted yet.</p>
            )}
          </div>

          {/* Clinical Intake Summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Presenting Clinical Factors</span>
              <History className="w-4 h-4 text-purple-600" />
            </h3>

            <div className="text-xs space-y-2.5 text-slate-700">
              <div>
                <span className="font-semibold text-slate-900 block mb-0.5">Presenting Complaints:</span>
                <p className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600">
                  {patient.history?.presentingComplaints || 'None recorded on intake.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-slate-900 block mb-0.5">Symptom Duration:</span>
                  <span className="text-slate-600">{patient.history?.symptomDuration || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900 block mb-0.5">Sleep Pattern:</span>
                  <span className="text-slate-600">{patient.history?.sleepPattern || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Demographics */}
      {activeTab === 'demographics' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Demographic Profile</h3>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Full Name:</span>
              <span className="font-semibold text-slate-900">{patient.firstName} {patient.lastName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-semibold text-slate-900">{new Date(patient.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Gender:</span>
              <span className="font-semibold text-slate-900">{patient.gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Education:</span>
              <span className="font-semibold text-slate-900">{patient.education || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Occupation:</span>
              <span className="font-semibold text-slate-900">{patient.occupation || 'N/A'}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Contact & Emergency Details</h3>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-900">{patient.contact?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Email:</span>
              <span className="font-semibold text-slate-900">{patient.contact?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-900">{patient.contact?.city}, {patient.contact?.state}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Emergency Contact:</span>
              <span className="font-semibold text-slate-900">{patient.contact?.emergencyName} ({patient.contact?.emergencyRelation})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Emergency Phone:</span>
              <span className="font-semibold text-slate-900">{patient.contact?.emergencyPhone}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Assessments */}
      {activeTab === 'assessments' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Standardized Assessment Sessions</h3>
            <Link to={`/sessions/new?patientId=${patient.id}`} className="btn-primary text-xs">
              <PlusCircle className="w-3.5 h-3.5 mr-1" /> New Assessment
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Scale Name</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Score & Severity</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patient.sessions?.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {s.assessment.name} ({s.assessment.shortName})
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.score ? (
                        <span>
                          <strong>{s.score.rawScore} pts</strong> — {s.score.severity}
                        </span>
                      ) : (
                        <span className="italic text-slate-400">In Progress</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <SessionStatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Link
                        to={`/sessions/${s.id}/results`}
                        className="btn-secondary px-2 py-1 text-xs"
                      >
                        Scores
                      </Link>
                      <Link
                        to={`/sessions/${s.id}/clinical-review`}
                        className="btn-purple px-2 py-1 text-xs"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Generated Clinical Screening Reports</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {patient.reports?.length === 0 ? (
              <p className="p-6 text-center text-slate-400 italic">No reports generated yet.</p>
            ) : (
              patient.reports?.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{r.title}</h4>
                      <span className="text-slate-400 text-[11px] font-mono">Ref: {r.reportNumber} • Reviewed by {r.reviewedByName}</span>
                    </div>
                  </div>
                  <Link to={`/reports/${r.id}`} className="btn-secondary text-xs">
                    View Report
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
