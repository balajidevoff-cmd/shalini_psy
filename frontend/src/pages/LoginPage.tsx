import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Sparkles, ShieldCheck, Stethoscope, UserCheck, Lock } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('shalini.devi@psyscan.local');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data.accessToken, res.data.data.refreshToken, res.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F294A] via-[#0B1E36] to-slate-950 opacity-90" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl ring-4 ring-blue-500/20">
            <Sparkles className="w-7 h-7 text-sky-200" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          PSYSCAN <span className="text-blue-400">AI</span>
        </h2>
        <p className="mt-1 text-center text-sm text-slate-400">
          AI-Assisted Psychological Screening & Clinical Decision Support
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                placeholder="clinician@psyscan.local"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Clinical Workspace</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Roles */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 text-center">
              Quick Switch Role Credentials
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('shalini.devi@psyscan.local')}
                className="flex items-center justify-between p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-purple-600 text-white rounded-md">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-purple-950">Shalini Devi V</span>
                    <span className="block text-[11px] text-purple-700">Senior Clinical Psychologist</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-purple-200 text-purple-800 px-2 py-0.5 rounded">
                  Primary Reviewer
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('assessor@psyscan.local')}
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-slate-700 text-white rounded-md">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">Ananya Sharma</span>
                    <span className="block text-[11px] text-slate-500">Psychometric Assessor</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                  Assessor
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@psyscan.local')}
                className="flex items-center justify-between p-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-blue-700 text-white rounded-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-blue-950">Dr. Ramesh Kumar</span>
                    <span className="block text-[11px] text-blue-700">Clinical Administrator</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                  Admin
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <DisclaimerBanner compact />
        </div>
      </div>
    </div>
  );
};
