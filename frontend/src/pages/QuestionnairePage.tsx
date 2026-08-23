import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { AssessmentSession, AssessmentQuestion } from '../types';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const QuestionnairePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, { value: number; label: string }>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('All changes saved');

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await api.get(`/sessions/${id}`);
        if (res.data.success) {
          const sessData: AssessmentSession = res.data.data;
          setSession(sessData);

          const qList = sessData.assessmentVersion?.questions || [];
          setQuestions(qList);

          // Populate existing answers if any
          const ansMap: Record<string, { value: number; label: string }> = {};
          sessData.responses?.forEach((r) => {
            ansMap[r.questionId] = {
              value: r.responseValue,
              label: r.responseText || '',
            };
          });
          setAnswers(ansMap);
        }
      } catch (err) {
        console.error('Failed to load questionnaire session:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id]);

  const handleSelectOption = async (questionId: string, val: number, label: string) => {
    const updated = { ...answers, [questionId]: { value: val, label } };
    setAnswers(updated);
    setAutoSaveStatus('Saving response...');

    try {
      await api.post(`/sessions/${id}/responses`, {
        responses: [{ questionId, responseValue: val, responseText: label }],
      });
      setAutoSaveStatus('Saved');
    } catch {
      setAutoSaveStatus('Auto-save failed');
    }
  };

  const handleCompleteAndScore = async () => {
    // Check if all required questions are answered
    const unanswered = questions.filter((q) => q.required && answers[q.id] === undefined);
    if (unanswered.length > 0) {
      alert(`Please answer all required questions before completing. (${unanswered.length} remaining)`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/sessions/${id}/complete`);
      if (res.data.success) {
        navigate(`/sessions/${id}/results`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Scoring engine failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading standardized questionnaire...</div>;
  }

  if (!session || questions.length === 0) {
    return <div className="p-12 text-center text-red-500">Session questionnaire items not found.</div>;
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Assessment Header Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
            {session.assessment.shortName}
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-1">{session.assessment.name}</h2>
          <p className="text-xs text-slate-500">
            Patient: <strong>{session.patient.firstName} {session.patient.lastName}</strong> ({session.patient.patientCode})
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-blue-700 block">
            {answeredCount} / {questions.length} Answered
          </span>
          <span className="text-[11px] text-slate-400 font-medium">{autoSaveStatus}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Instructions */}
      {session.assessmentVersion?.instructions && (
        <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
          <strong className="text-blue-950 font-bold block mb-0.5">Instructions:</strong>
          {session.assessmentVersion.instructions}
        </div>
      )}

      {!showReview ? (
        /* Single Question View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </span>
            {currentQ.subscale && (
              <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                Subscale: {currentQ.subscale}
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQ.questionNumber}. {currentQ.questionText}
          </h3>

          {/* Options List */}
          <div className="space-y-3 pt-2">
            {currentQ.options?.map((opt) => {
              const isSelected = answers[currentQ.id]?.value === opt.value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.value, opt.label)}
                  className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-sm ring-2 ring-blue-600/20 font-bold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="btn-secondary text-xs disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>

            <button
              type="button"
              onClick={() => setShowReview(true)}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Review All ({answeredCount}/{questions.length})
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="btn-primary text-xs"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowReview(true)}
                className="btn-purple text-xs"
              >
                Proceed to Review <CheckCircle2 className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Review Answers Screen */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Review Questionnaire Answers</h3>
              <p className="text-xs text-slate-500">Confirm all responses prior to deterministic scoring calculation</p>
            </div>
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="btn-secondary text-xs"
            >
              Back to Questions
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {questions.map((q, idx) => {
              const ans = answers[q.id];
              return (
                <div key={q.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-900">
                      {q.questionNumber}. {q.questionText}
                    </span>
                    <p className={`font-bold ${ans ? 'text-blue-700' : 'text-red-500 italic'}`}>
                      Response: {ans ? `${ans.label} (Score: ${ans.value})` : 'Unanswered'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowReview(false);
                    }}
                    className="text-xs text-slate-500 hover:text-blue-700 underline font-semibold flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowReview(false)}
              className="btn-secondary text-xs"
            >
              Back
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleCompleteAndScore}
              className="btn-primary text-xs px-6 py-2.5 shadow-md flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Scoring Deterministically...' : 'Complete & Calculate Clinical Score'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
