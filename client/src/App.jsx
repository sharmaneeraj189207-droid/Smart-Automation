import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { MainLayout } from './components/layout/MainLayout.jsx';

import { LandingPage } from './pages/LandingPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { RequestsPage } from './pages/RequestsPage.jsx';
import { RequestCreatePage } from './pages/RequestCreatePage.jsx';
import { RequestDetailPage } from './pages/RequestDetailPage.jsx';
import { TasksPage } from './pages/TasksPage.jsx';
import { ApprovalsPage } from './pages/ApprovalsPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { AuditLogsPage } from './pages/AuditLogsPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { UsersPage } from './pages/admin/UsersPage.jsx';
import { DepartmentsPage } from './pages/admin/DepartmentsPage.jsx';
import { RulesPage } from './pages/admin/RulesPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/requests/new" element={<RequestCreatePage />} />
              <Route path="/requests/:id" element={<RequestDetailPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route
                path="/approvals"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <ApprovalsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route
                path="/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Admin Routes */}
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DepartmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/rules"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <RulesPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
