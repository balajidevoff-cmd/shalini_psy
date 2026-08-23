import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Report } from '../types';
import { FileText, Download, Eye, Stethoscope, Search } from 'lucide-react';
import { RiskBadge } from '../components/StatusBadge';

export const ReportsListPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.get('/reports');
        if (res.data.success) {
          setReports(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleDownloadPdf = async (sessionId: string, reportNumber: string) => {
    try {
      const res = await api.get(`/reports/sessions/${sessionId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF report.');
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.reportNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
      r.patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
      r.patient.patientCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clinical Screening Reports</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Finalized psychological reports signed by licensed clinical psychologists.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-card">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by report number, patient code, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading reports directory...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic">No reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Report Number</th>
                  <th className="px-5 py-3">Patient</th>
                  <th className="px-5 py-3">Assessment Scale</th>
                  <th className="px-5 py-3">Reviewed By</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      {r.reportNumber}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {r.patient.firstName} {r.patient.lastName}
                      <span className="block text-[11px] font-mono text-slate-400 font-normal">{r.patient.patientCode}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">
                      {r.session?.assessment?.name || 'Screening Scale'}
                    </td>
                    <td className="px-5 py-3.5 text-purple-950 font-semibold">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                        {r.reviewedByName}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">{r.reviewedByRole}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {new Date(r.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right space-x-2">
                      <Link to={`/reports/${r.id}`} className="btn-secondary text-xs px-2.5 py-1">
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </Link>
                      <button
                        onClick={() => handleDownloadPdf(r.sessionId, r.reportNumber)}
                        className="btn-primary text-xs px-2.5 py-1"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
