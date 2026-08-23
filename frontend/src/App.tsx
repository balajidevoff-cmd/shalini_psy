import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsListPage } from './pages/PatientsListPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { NewPatientPage } from './pages/NewPatientPage';
import { AssessmentsCatalogPage } from './pages/AssessmentsCatalogPage';
import { NewSessionPage } from './pages/NewSessionPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { ScoreResultPage } from './pages/ScoreResultPage';
import { AIReviewPage } from './pages/AIReviewPage';
import { ClinicalReviewPage } from './pages/ClinicalReviewPage';
import { ReportsListPage } from './pages/ReportsListPage';
import { ReportViewPage } from './pages/ReportViewPage';
import { FollowupsPage } from './pages/FollowupsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({
  children,
  roles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Clinical Workspace */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Patients Module */}
            <Route path="patients" element={<PatientsListPage />} />
            <Route path="patients/new" element={<NewPatientPage />} />
            <Route path="patients/:id" element={<PatientDetailPage />} />

            {/* Assessments & Questionnaire Sessions */}
            <Route path="assessments" element={<AssessmentsCatalogPage />} />
            <Route path="sessions" element={<DashboardPage />} />
            <Route path="sessions/new" element={<NewSessionPage />} />
            <Route path="sessions/:id/questions" element={<QuestionnairePage />} />
            <Route path="sessions/:id/results" element={<ScoreResultPage />} />
            <Route path="sessions/:id/ai-review" element={<AIReviewPage />} />
            <Route path="sessions/:id/clinical-review" element={<ClinicalReviewPage />} />
            <Route path="reviews" element={<DashboardPage />} />

            {/* Reports & Follow-ups */}
            <Route path="reports" element={<ReportsListPage />} />
            <Route path="reports/:id" element={<ReportViewPage />} />
            <Route path="followups" element={<FollowupsPage />} />

            {/* Admin Module */}
            <Route
              path="admin/users"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/audit-logs"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminAuditLogsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
export default App;
