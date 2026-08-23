import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Patient } from '../types';
import { Search, UserPlus, Eye, FileSpreadsheet, Stethoscope } from 'lucide-react';
import { RiskBadge } from '../components/StatusBadge';

export const PatientsListPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const res = await api.get('/patients', {
          params: { search, status: statusFilter || undefined },
        });
        if (res.data.success) {
          setPatients(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchPatients, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Registered patients, clinical intake records, and assigned psychologists.
          </p>
        </div>
        <Link to="/patients/new" className="btn-primary text-xs">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Register New Patient
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient code, first name, last name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="DISCHARGED">Discharged</option>
        </select>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading patients directory...</div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No patient records found. Click &quot;Register New Patient&quot; to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Patient Code</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Age / Gender</th>
                  <th className="px-5 py-3">Assigned Psychologist</th>
                  <th className="px-5 py-3">Latest Screening</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((p) => {
                  const latestSession = p.sessions?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-900">{p.patientCode}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {p.firstName} {p.lastName}
                        {p.occupation && <span className="block text-[11px] text-slate-400 font-normal">{p.occupation}</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {p.age} yrs / {p.gender}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700">
                        <span className="font-semibold text-purple-950 flex items-center gap-1">
                          <Stethoscope className="w-3 h-3 text-purple-600" />
                          {p.assignedPsychologist?.firstName || 'Shalini Devi'} {p.assignedPsychologist?.lastName || 'V'}
                        </span>
                        <span className="text-[10px] text-slate-400">Senior Clinical Reviewer</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {latestSession ? (
                          <div>
                            <span className="font-semibold text-slate-800">{latestSession.assessment?.shortName}</span>
                            <span className="block text-[11px] text-amber-700 font-medium">
                              {latestSession.score?.severity || 'In Progress'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No assessments yet</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <Link
                          to={`/patients/${p.id}`}
                          className="btn-secondary px-2.5 py-1 text-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
