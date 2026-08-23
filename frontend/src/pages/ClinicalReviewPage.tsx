import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { AssessmentSession, ClinicalReview, RiskLevel } from '../types';
import {
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Save,
  CheckCheck,
  ArrowLeft,
  Sparkles,
  User,
  History,
  FileText,
} from 'lucide-react';
import { ScoreCard } from '../components/ScoreCard';
import { RiskBadge, SessionStatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';

export const ClinicalReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [clinicalInterview, setClinicalInterview] = useState('');
  const [clinicalObservations, setClinicalObservations] = useState('');
  const [areasOfConcern, setAreasOfConcern] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  const [riskJustification, setRiskJustification] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [selectedFurtherAssessments, setSelectedFurtherAssessments] = useState<string[]>([
    'GAD-7 (Generalized Anxiety Disorder-7)',
    'Insomnia Severity Index (ISI)',
  ]);
  const [referralPlan, setReferralPlan] = useState('Outpatient psychotherapy protocol.');
  const [followUpPlanNotes, setFollowUpPlanNotes] = useState('Weekly 50-minute psychotherapy sessions.');
  const [finalClinicalImpression, setFinalClinicalImpression] = useState('');

  const allAvailableScales = [
    'GAD-7 (Generalized Anxiety Disorder-7)',
    'Insomnia Severity Index (ISI)',
    'Perceived Stress Scale (PSS-10)',
    'Beck Anxiety Inventory (BAI)',
    'Beck Depression Inventory-II (BDI-II)',
    'BRIEF Executive Function Screening',
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [sessRes, revRes] = await Promise.all([
          api.get(`/sessions/${id}`),
          api.get(`/reviews/sessions/${id}`),
        ]);

        if (sessRes.data.success) {
          const sess: AssessmentSession = sessRes.data.data;
          setSession(sess);

          const rev: ClinicalReview | null = revRes.data.data;
          if (rev) {
            setClinicalInterview(rev.clinicalInterview || '');
            setClinicalObservations(rev.clinicalObservations || '');
            setAreasOfConcern(rev.areasOfConcern || '');
            setRiskLevel(rev.riskLevel || 'LOW');
            setRiskJustification(rev.riskJustification || '');
            setRecommendations(rev.recommendations || '');
            setReferralPlan(rev.referralPlan || '');
            setFollowUpPlanNotes(rev.followUpPlanNotes || '');
            setFinalClinicalImpression(rev.finalClinicalImpression || '');
            if (rev.furtherAssessments) {
              try {
                setSelectedFurtherAssessments(JSON.parse(rev.furtherAssessments));
              } catch {
                // Keep default
              }
            }
          } else {
            // Pre-fill smart clinical drafting based on deterministic scores
            setClinicalObservations(
              `Patient is alert, cooperative, and oriented. Congruous mood and affect matching self-report ${sess.score?.severity || 'screening scores'}.`
            );
            setFinalClinicalImpression(
              `Screening scores and clinical presentation indicate ${sess.score?.severity || 'elevated symptoms'}. Clinical trajectory responsive to structured outpatient intervention.`
            );
            setRecommendations(
              `1. Initiate Cognitive Behavioral Therapy (CBT).\n2. Implement targeted sleep hygiene & stress reduction strategies.\n3. Conduct ongoing symptom trajectory monitoring.`
            );
          }
        }
      } catch (err) {
        console.error('Failed to load clinical review workspace:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSaveReview = async (finalize = false) => {
    setSaving(true);
    setErrorMessage(null);
    setToastMessage(null);

    try {
      const res = await api.post(`/reviews/sessions/${id}`, {
        clinicalInterview,
        clinicalObservations,
        areasOfConcern,
        riskLevel,
        riskJustification,
        recommendations,
        furtherAssessments: selectedFurtherAssessments,
        referralPlan,
        followUpPlanNotes,
        finalClinicalImpression,
        finalize,
      });

      if (res.data.success) {
        setToastMessage(finalize ? 'Clinical review finalized & report created!' : 'Draft review saved successfully.');
        setShowConfirmModal(false);
        if (finalize) {
          setTimeout(() => {
            navigate('/reports');
          }, 1200);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to save clinical review.');
      setShowConfirmModal(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleScale = (scaleName: string) => {
    if (selectedFurtherAssessments.includes(scaleName)) {
      setSelectedFurtherAssessments(selectedFurtherAssessments.filter((s) => s !== scaleName));
    } else {
      setSelectedFurtherAssessments([...selectedFurtherAssessments, scaleName]);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading Clinical Review Workspace...</div>;
  }

  if (!session) {
    return <div className="p-12 text-center text-red-500">Session data not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            to={`/patients/${session.patientId}`}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Psychologist Clinical Review</h1>
              <SessionStatusBadge status={session.status} />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Patient: <strong>{session.patient.firstName} {session.patient.lastName}</strong> ({session.patient.patientCode}) • Scale: {session.assessment.name}
            </p>
          </div>
        </div>

        {/* Clinical Reviewer Banner */}
        <div className="flex items-center space-x-2 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-xl">
          <Stethoscope className="w-4 h-4 text-purple-700" />
          <div className="text-left text-xs">
            <span className="text-purple-600 block text-[10px] uppercase font-bold">Clinical Reviewer</span>
            <span className="font-extrabold text-purple-950">Shalini Devi V</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCheck className="w-4 h-4 text-emerald-600" />
          {toastMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          {errorMessage}
        </div>
      )}

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Data, Scores, Intake Factors, AI Observations (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Deterministic Score Snapshot */}
          {session.score && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Screening Score Snapshot
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: session.score.severityColor || '#3B82F6' }}
                >
                  {session.score.severity}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Total Score:</span>
                <span className="font-extrabold text-slate-900 text-base">
                  {session.score.rawScore} / {session.score.maxPossibleScore}
                </span>
              </div>
              <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {session.score.interpretation}
              </p>
            </div>
          )}

          {/* 2. Patient Intake Factors */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-2.5 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
              Patient Factors & Complaints
            </h3>
            <div>
              <span className="font-semibold text-slate-900">Presenting Concerns:</span>
              <p className="text-slate-600 mt-0.5">{session.patient.history?.presentingComplaints || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400">Duration:</span>{' '}
                <span className="font-semibold text-slate-800">{session.patient.history?.symptomDuration || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400">Sleep:</span>{' '}
                <span className="font-semibold text-slate-800">{session.patient.history?.sleepPattern || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* 3. AI Screening Suggestions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-card space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                Reviewed AI Suggestions
              </h3>
              <Link to={`/sessions/${session.id}/ai-review`} className="text-[11px] text-blue-600 font-semibold hover:underline">
                Edit Decisions
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              {session.aiAnalysis?.suggestions?.map((sug) => (
                <div
                  key={sug.id}
                  className={`p-2.5 rounded-lg border text-slate-700 ${
                    sug.status === 'ACCEPTED'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : sug.status === 'REJECTED'
                      ? 'bg-slate-50 border-slate-200 opacity-50'
                      : 'bg-purple-50/70 border-purple-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-[11px] text-slate-900">{sug.title}</span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{sug.status}</span>
                  </div>
                  <p className="text-[11px]">{sug.modifiedContent || sug.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clinical Review Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">Psychological Review & Integration Form</h2>
              <p className="text-xs text-slate-500">Record observations, risk evaluation, recommendations, and impressions</p>
            </div>

            {/* 1. Clinical Interview */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Clinical Interview Notes
              </label>
              <textarea
                rows={3}
                value={clinicalInterview}
                onChange={(e) => setClinicalInterview(e.target.value)}
                placeholder="Document patient engagement, response consistency, and interview findings..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* 2. Clinical Observations */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Clinical Observations
              </label>
              <textarea
                rows={3}
                value={clinicalObservations}
                onChange={(e) => setClinicalObservations(e.target.value)}
                placeholder="Mental status observations: appearance, eye contact, speech rate, thought congruity, insight..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* 3. Areas of Concern */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Identified Areas of Concern
              </label>
              <input
                type="text"
                value={areasOfConcern}
                onChange={(e) => setAreasOfConcern(e.target.value)}
                placeholder="e.g. Sleep onset difficulty, work-related perfectionism, concentration fatigue"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* 4. Risk Review with Justification */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                Clinician Risk Evaluation Level *
              </label>
              <div className="flex space-x-3">
                {(['LOW', 'MODERATE', 'HIGH'] as RiskLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRiskLevel(lvl)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      riskLevel === lvl
                        ? lvl === 'HIGH'
                          ? 'bg-red-600 text-white border-red-700 shadow-sm'
                          : lvl === 'MODERATE'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {lvl} RISK
                  </button>
                ))}
              </div>

              {(riskLevel === 'MODERATE' || riskLevel === 'HIGH') && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-red-800 mb-1">
                    Risk Justification (Mandatory for Elevated Ratings) *
                  </label>
                  <input
                    type="text"
                    required
                    value={riskJustification}
                    onChange={(e) => setRiskJustification(e.target.value)}
                    placeholder="State clinical rationale, protective factors, and safety protocols..."
                    className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}
            </div>

            {/* 5. Suggested Further Assessments */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Suggested Further Standardized Screenings
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {allAvailableScales.map((scale) => {
                  const isChecked = selectedFurtherAssessments.includes(scale);
                  return (
                    <label
                      key={scale}
                      className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        isChecked ? 'bg-purple-50 border-purple-300 text-purple-950 font-semibold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleScale(scale)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-[11px] truncate">{scale}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 6. Recommendations & Interventions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Recommendations & Psychotherapy Plan
              </label>
              <textarea
                rows={3}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* 7. Final Clinical Impression (Crucial Clinician Decision) */}
            <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl space-y-2">
              <label className="block text-xs font-black text-purple-950 uppercase tracking-wider">
                Final Clinical Impression (Clinician Final Decision) *
              </label>
              <p className="text-[11px] text-purple-700 font-medium">
                This impression represents the licensed clinician&apos;s authoritative evaluation and will be printed on the official report.
              </p>
              <textarea
                rows={3}
                required
                value={finalClinicalImpression}
                onChange={(e) => setFinalClinicalImpression(e.target.value)}
                placeholder="Enter formal clinical impression..."
                className="w-full p-3 bg-white border border-purple-300 rounded-lg text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            {/* Review Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveReview(false)}
                className="btn-secondary w-full sm:w-auto text-xs"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {saving ? 'Saving Draft...' : 'Save Draft Review'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => setShowConfirmModal(true)}
                className="btn-purple w-full sm:w-auto text-xs px-5 py-2.5 shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                Finalize Clinical Review & Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Finalize Clinical Review?"
        message="Finalizing this review permanently records the clinician's current clinical judgment (Shalini Devi V) and produces the official screening report. Continue?"
        confirmLabel="Yes, Finalize Clinical Review"
        cancelLabel="Keep Reviewing"
        onConfirm={() => handleSaveReview(true)}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
