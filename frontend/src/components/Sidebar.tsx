import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileCheck2,
  Sparkles,
  Stethoscope,
  FileText,
  CalendarClock,
  ShieldCheck,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Patients', path: '/patients', icon: Users },
    { label: 'Assessments', path: '/assessments', icon: ClipboardList },
    { label: 'Assessment Sessions', path: '/sessions', icon: FileCheck2 },
    { label: 'Clinical Review', path: '/reviews', icon: Stethoscope, roles: ['PSYCHOLOGIST', 'ADMIN'] },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Follow-up', path: '/followups', icon: CalendarClock },
  ];

  const adminItems = [
    { label: 'User Management', path: '/admin/users', icon: UserIcon },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-[#0F294A] text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 shadow-xl min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
          <Sparkles className="w-5 h-5 text-sky-200" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            PSYSCAN <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/30 text-sky-300 font-semibold">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Psychological Screening Support</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Clinical Workspace
        </div>

        {navItems.map((item) => {
          if (item.roles && !hasRole(item.roles as any)) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4 mr-3 text-slate-400 group-hover:text-white" />
              {item.label}
            </NavLink>
          );
        })}

        {hasRole(['ADMIN']) && (
          <>
            <div className="pt-5 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Administration
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4 mr-3 text-slate-400" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0B203B]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-inner">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="inline-block text-[11px] font-medium text-sky-400 truncate">
                {user?.role === 'PSYCHOLOGIST' ? 'Clinical Psychologist' : user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
