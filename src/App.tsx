import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AdminSidebar } from './components/layout/AdminSidebar';

// Importe suas páginas aqui
import { Dashboard } from './pages/Dashboard';
import { PaymentSettings } from './pages/PaymentSettings';
import { UserSettings } from './pages/UserSettings';
import { Reports } from './pages/Reports';

export const App: React.FC = () => {
  return (
    <Layout>
      <AdminSidebar />
      <div className="ml-64 min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/payments" element={<PaymentSettings />} />
          <Route path="/admin/settings" element={<UserSettings />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Routes>
      </div>
    </Layout>
  );
};