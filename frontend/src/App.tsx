import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';

import LoginPage     from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import EntitiesPage  from '@/pages/EntitiesPage';
import VaultPage     from '@/pages/VaultPage';
import GeneratorPage from '@/pages/GeneratorPage';
import ReportsPage   from '@/pages/ReportsPage';
import UsersPage     from '@/pages/UsersPage';
import SettingsPage  from '@/pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="entities"  element={<EntitiesPage />} />
            <Route path="vault"     element={<VaultPage />} />
            <Route path="generator" element={<GeneratorPage />} />
            <Route path="reports"   element={<ReportsPage />} />
            <Route path="users"     element={<UsersPage />} />
            <Route path="settings"  element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
        }}
      />
    </QueryClientProvider>
  );
}
