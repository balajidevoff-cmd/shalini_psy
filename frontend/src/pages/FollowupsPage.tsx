import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { FollowUpPlan } from '../types';
import { CalendarClock, Plus, CheckCircle2, Clock, XCircle, Stethoscope, AlertCircle } from 'lucide-react';

export const FollowupsPage: React.FC = () => {
  const [followups, setFollowups] = useState<FollowUpPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFollowups() {
      try {
        const res = await api.get('/followups');
        if (res.data.success) {
          setFollowups(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load followups:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFollowups();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/followups/${id}/status`, { status: newStatus });
      if (res.data.success) {
        setFollowups((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: newStatus as any } : f))
        );
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Follow-up & Monitoring</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Symptom trajectory tracking, psychotherapy follow-up sessions, and patient monitoring plans.
          </p>
        </div>
      </div>

      {/* Follow-up Timeline & Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading follow-up schedules...</div>
        ) : followups.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic">No follow-up plans scheduled.</div>
        ) : (
          <div className="space-y-4">
            {followups.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl flex-shrink-0 mt-0.5">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {f.patient.firstName} {f.patient.lastName} ({f.patient.patientCode})
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {f.followUpType}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">{f.purpose}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span>Date: <strong>{new Date(f.scheduledDate).toLocaleDateString()}</strong></span>
                      <span>• Clinician: <strong>Shalini Devi V</strong></span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center space-x-2">
                  <select
                    value={f.status}
                    onChange={(e) => handleStatusChange(f.id, e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="MISSED">Missed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
