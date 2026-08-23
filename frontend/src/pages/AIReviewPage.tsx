import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { AIAnalysis, AISuggestion } from '../types';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Edit3,
  Stethoscope,
  ArrowLeft,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const AIReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [modifyingId, setModifyingId] = useState<string | null>(null);
  const [modText, setModText] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    async function loadAI() {
      try {
        const res = await api.get(`/ai/sessions/${id}`);
        if (res.data.success) {
          setAiAnalysis(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load AI suggestions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAI();
  }, [id]);

  const handleDecision = async (
    sugId: string,
    status: 'ACCEPTED' | 'MODIFIED' | 'REJECTED',
    modifiedContent?: string,
    comment?: string
  ) => {
    try {
      const res = await api.post(`/ai/suggestions/${sugId}/decide`, {
        status,
        modifiedContent,
        decisionComment: comment,
      });

      if (res.data.success) {
        setAiAnalysis((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            suggestions: prev.suggestions.map((s) => (s.id === sugId ? res.data.data : s)),
          };
        });
        setModifyingId(null);
        setModText('');
        setCommentText('');
      }
    } catch (err) {
      alert('Failed to update clinician decision.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading AI Screening Suggestions...</div>;
  }

  if (!aiAnalysis) {
    return <div className="p-12 text-center text-red-500">AI analysis record not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={`/sessions/${id}/results`}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Scores
        </Link>
        <Link
          to={`/sessions/${id}/clinical-review`}
          className="btn-purple text-xs flex items-center gap-1.5"
        >
          <Stethoscope className="w-3.5 h-3.5" /> Continue to Clinical Review
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm">
            <Sparkles className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">AI-Assisted Screening Summary</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-200">
                Awaiting Clinician Review
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Engine: {aiAnalysis.modelName} (v{aiAnalysis.modelVersion}) • Non-autonomous decision support
            </p>
          </div>
        </div>

        {/* AI Screening Synthesis */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900 font-bold block mb-1">Synthesized Screening Overview:</strong>
          <p>{aiAnalysis.summary}</p>
        </div>
      </div>

      {/* Suggestion Cards List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Individual Clinical Screening Observations ({aiAnalysis.suggestions.length})
        </h2>

        {aiAnalysis.suggestions.map((sug: AISuggestion) => {
          const isModifying = modifyingId === sug.id;

          return (
            <div
              key={sug.id}
              className={`bg-white border rounded-2xl p-5 shadow-card transition-all ${
                sug.status === 'ACCEPTED'
                  ? 'border-emerald-300 ring-1 ring-emerald-200/50'
                  : sug.status === 'REJECTED'
                  ? 'border-slate-300 opacity-60 bg-slate-50/70'
                  : sug.status === 'MODIFIED'
                  ? 'border-purple-300 ring-1 ring-purple-200/50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                    {sug.suggestionType}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{sug.title}</h3>
                </div>

                {/* Clinician Decision Badge */}
                <div>
                  {sug.status === 'ACCEPTED' && (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Accepted by Clinician
                    </span>
                  )}
                  {sug.status === 'REJECTED' && (
                    <span className="inline-flex items-center text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Rejected by Clinician
                    </span>
                  )}
                  {sug.status === 'MODIFIED' && (
                    <span className="inline-flex items-center text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 gap-1">
                      <Edit3 className="w-3.5 h-3.5" /> Modified by Clinician
                    </span>
                  )}
                  {sug.status === 'PENDING' && (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Pending Decision
                    </span>
                  )}
                </div>
              </div>

              {/* Content Body */}
              <div className="text-xs text-slate-700 leading-relaxed mb-4">
                <p className="font-medium">{sug.modifiedContent || sug.content}</p>
                {sug.decisionComment && (
                  <p className="mt-2 p-2 bg-purple-50 text-purple-900 rounded-md italic border border-purple-100">
                    Clinician Note: {sug.decisionComment}
                  </p>
                )}
              </div>

              {/* Modify Input Mode */}
              {isModifying && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Modified Clinician Content:</label>
                  <textarea
                    rows={2}
                    value={modText}
                    onChange={(e) => setModText(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <label className="block text-[11px] font-bold text-slate-700">Clinician Rationale / Comment:</label>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="e.g. Adjusted to match patient clinical intake history."
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModifyingId(null)}
                      className="btn-secondary text-[11px] px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(sug.id, 'MODIFIED', modText, commentText)}
                      className="btn-purple text-[11px] px-3 py-1"
                    >
                      Save Modified Suggestion
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons for Psychologist */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDecision(sug.id, 'ACCEPTED')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Accept Suggestion
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModifyingId(sug.id);
                    setModText(sug.modifiedContent || sug.content);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Modify
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision(sug.id, 'REJECTED', undefined, 'Clinician excluded from final clinical impression.')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
