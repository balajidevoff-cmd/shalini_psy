import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { AssessmentSession } from '../types';
import { ScoreCard } from '../components/ScoreCard';
import {
  Sparkles,
  Stethoscope,
  ArrowLeft,
  FileText,
  BarChart3,
  CheckCircle2,
  CalendarClock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const ScoreResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await api.get(`/sessions/${id}`);
        if (res.data.success) {
          setSession(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch session results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading scoring calculation...</div>;
  }

  if (!session || !session.score) {
    return (
      <div className="p-12 text-center text-red-500">
        Score data not found for this session.
      </div>
    );
  }

  const subscaleChartData =
    session.score.subscaleScores?.map((s) => ({
      name: s.subscaleName,
      raw: s.rawScore,
      max: s.maxScore,
      severity: s.severity,
      color: s.colorHex || '#3B82F6',
    })) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb & Next Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(`/patients/${session.patientId}`)}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Profile
        </button>

        <div className="flex items-center space-x-3">
          <Link
            to={`/sessions/${session.id}/ai-review`}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            View AI Screening Summary
          </Link>
          <Link
            to={`/sessions/${session.id}/clinical-review`}
            className="btn-purple text-xs flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Open Clinical Review Workspace
          </Link>
        </div>
      </div>

      {/* Main Deterministic Score Card */}
      <ScoreCard score={session.score} assessmentName={session.assessment.name} />

      {/* Subscale Breakdown Chart */}
      {subscaleChartData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Subscale Score Profile
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Component distribution across clinical sub-domains
          </p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscaleChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="raw" name="Raw Score" radius={[4, 4, 0, 0]}>
                  {subscaleChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Action Guidance Banner */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-black text-purple-950 text-base">Next Clinical Step: Psychologist Review</h4>
          <p className="text-xs text-purple-800 mt-1 max-w-xl leading-relaxed">
            AI Screening Analysis has automatically synthesized pattern observations. Psychologist <strong>Shalini Devi V</strong> may now inspect, accept, modify, or reject AI suggestions and record final clinical impressions.
          </p>
        </div>
        <Link
          to={`/sessions/${session.id}/clinical-review`}
          className="btn-purple text-xs whitespace-nowrap px-5 py-2.5 shadow-md flex items-center gap-1.5 flex-shrink-0"
        >
          <Stethoscope className="w-4 h-4" /> Start Clinical Review
        </Link>
      </div>
    </div>
  );
};
