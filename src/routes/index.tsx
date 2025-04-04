import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { PaymentPlatforms } from '../pages/settings/PaymentPlatforms';
import { Settings } from '../pages/settings/Settings';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isAuthenticated } = useAuth();
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/login" />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </PrivateRoute>
      } />
      
      <Route path="/settings" element={
        <AdminRoute>
          <Layout>
            <Settings />
          </Layout>
        </AdminRoute>
      } />
      
      <Route path="/settings/payment-platforms" element={
        <AdminRoute>
          <Layout>
            <PaymentPlatforms />
          </Layout>
        </AdminRoute>
      } />
    </Routes>
  );
}; 