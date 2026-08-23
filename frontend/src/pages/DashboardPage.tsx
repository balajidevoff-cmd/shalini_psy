import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Users,
  FileCheck2,
  AlertOctagon,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  PlusCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { RiskBadge, SessionStatusBadge } from '../components/StatusBadge';
import { AssessmentSession } from '../types';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await api.get('/dashboard/metrics');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  const cards = metrics?.cards || {
    totalPatients: 0,
    activeAssessments: 0,
    completedSessions: 0,
    pendingReviews: 0,
    highRiskFlags: 0,
    followUpsDue: 0,
    reportsGenerated: 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Screening Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Standardized psychometrics, deterministic severity scoring, and AI-assisted screening decision support.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/patients/new" className="btn-secondary text-xs">
            <PlusCircle className="w-4 h-4 mr-1.5 text-blue-600" />
            New Patient
          </Link>
          <Link to="/sessions/new" className="btn-primary text-xs">
            <Activity className="w-4 h-4 mr-1.5" />
            Start Assessment
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Patients</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{cards.totalPatients}</span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center mt-0.5">Active Directory</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Completed Screenings</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{cards.completedSessions}</span>
            <span className="text-[11px] text-blue-600 font-medium flex items-center mt-0.5">Deterministic Scored</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pending Review</span>
            <span className="text-2xl font-black text-purple-700 mt-1 block">{cards.pendingReviews}</span>
            <span className="text-[11px] text-purple-600 font-medium flex items-center mt-0.5">Clinician Decisions</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">High-Risk Flags</span>
            <span className="text-2xl font-black text-red-600 mt-1 block">{cards.highRiskFlags}</span>
            <span className="text-[11px] text-red-600 font-semibold flex items-center mt-0.5">Priority Action</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Screening Severity Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">Classifications based on authorized score bands</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.charts?.severityDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {metrics?.charts?.severityDistribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Screening Trend Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Assessment Completion & Review Trajectory
          </h3>
          <p className="text-xs text-slate-400 mb-4">Monthly screening throughput</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.charts?.completionTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="screened" name="Screenings Administered" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Clinical Reviews Finalized" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Assessment Sessions</h3>
            <p className="text-xs text-slate-400">Latest standardized questionnaires administered</p>
          </div>
          <Link to="/sessions" className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1">
            View All Sessions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Assessment Scale</th>
                <th className="px-5 py-3">Score & Severity</th>
                <th className="px-5 py-3">Risk Level</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics?.recentSessions?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No sessions recorded yet.
                  </td>
                </tr>
              ) : (
                metrics?.recentSessions?.map((session: AssessmentSession) => (
                  <tr key={session.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div>{session.patient.firstName} {session.patient.lastName}</div>
                      <span className="text-[11px] font-mono text-slate-400">{session.patient.patientCode}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 font-medium">
                      {session.assessment.shortName}
                      <span className="block text-[11px] text-slate-400 font-normal">{session.assessment.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {session.score ? (
                        <div>
                          <span className="font-bold text-slate-900">{session.score.rawScore} pts</span>
                          <span className="block text-[11px] text-amber-700 font-medium">{session.score.severity}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">In progress</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <RiskBadge level={session.clinicalReview?.riskLevel || (session.score?.hasRiskFlag ? 'HIGH' : 'LOW')} />
                    </td>
                    <td className="px-5 py-3.5">
                      <SessionStatusBadge status={session.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to={`/sessions/${session.id}/clinical-review`}
                        className="inline-flex items-center text-xs font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        Clinical Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
