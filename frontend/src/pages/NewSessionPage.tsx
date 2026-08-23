import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { Patient, Assessment } from '../types';
import { Play, ArrowLeft, ShieldCheck, UserCheck, Stethoscope } from 'lucide-react';

export const NewSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(searchParams.get('patientId') || '');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(searchParams.get('assessmentId') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [patRes, asmtRes] = await Promise.all([api.get('/patients'), api.get('/assessments')]);
        if (patRes.data.success) setPatients(patRes.data.data);
        if (asmtRes.data.success) {
          setAssessments(asmtRes.data.data);
          if (!selectedAssessmentId && asmtRes.data.data.length > 0) {
            setSelectedAssessmentId(asmtRes.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load session options:', err);
      }
    }
    loadOptions();
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedAssessmentId) {
      setError('Please select both a patient and an assessment scale.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/sessions', {
        patientId: selectedPatientId,
        assessmentId: selectedAssessmentId,
      });

      if (res.data.success) {
        navigate(`/sessions/${res.data.data.id}/questions`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);
  const selectedAssessment = assessments.find((a) => a.id === selectedAssessmentId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleStart} className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <h2 className="text-xl font-black text-slate-900">Initiate Assessment Session</h2>
          <p className="text-xs text-slate-500 mt-0.5">Select recipient patient and standardized questionnaire instrument</p>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              1. Select Patient *
            </label>
            <select
              value={selectedPatientId}
              required
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              <option value="">-- Choose Patient from Directory --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.patientCode} — {p.firstName} {p.lastName} ({p.age} yrs, {p.gender})
                </option>
              ))}
            </select>

            {selectedPatient && (
              <div className="mt-3 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs flex justify-between items-center text-slate-700">
                <div>
                  <span className="font-bold text-blue-950">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                  <span className="block text-slate-500">{selectedPatient.occupation || 'Patient'} • Age {selectedPatient.age}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Shalini Devi V
                  </span>
                  <span className="text-[10px] text-slate-400">Clinical Reviewer</span>
                </div>
              </div>
            )}
          </div>

          {/* Assessment Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. Select Standardized Scale *
            </label>
            <select
              value={selectedAssessmentId}
              required
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-600"
            >
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.shortName} — {a.name} ({a.domain?.name})
                </option>
              ))}
            </select>

            {selectedAssessment && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
                <span className="font-bold text-slate-900 block">{selectedAssessment.name}</span>
                <p className="text-slate-500 leading-relaxed">{selectedAssessment.description}</p>
                <div className="pt-2 text-[11px] font-semibold text-blue-700 flex items-center gap-3">
                  <span>Target Age: {selectedAssessment.ageMin} – {selectedAssessment.ageMax} yrs</span>
                  <span>• Mode: {selectedAssessment.administrationType}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary text-xs">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary text-xs">
            <Play className="w-4 h-4 mr-1.5" />
            {loading ? 'Initializing Session...' : 'Begin Screening Questionnaire'}
          </button>
        </div>
      </form>
    </div>
  );
};
