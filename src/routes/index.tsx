import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { AuthForm } from '../components/auth/AuthForm';
import { CampaignList } from '../components/campaigns/CampaignList';
import { CampaignForm } from '../components/campaigns/CampaignForm';
import { UtmList } from '../components/utm/UtmList';
import { UtmForm } from '../components/utm/UtmForm';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { PaymentPlatformSettings } from '../components/payment/PaymentPlatformSettings';
import { useAuth } from '../hooks/useAuth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthForm mode="login" />} />
      <Route path="/register" element={<AuthForm mode="register" />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <CampaignList />
          </PrivateRoute>
        }
      />

      <Route
        path="/campaigns"
        element={
          <PrivateRoute>
            <CampaignList />
          </PrivateRoute>
        }
      />

      <Route
        path="/campaigns/new"
        element={
          <PrivateRoute>
            <CampaignForm />
          </PrivateRoute>
        }
      />

      <Route
        path="/campaigns/:id"
        element={
          <PrivateRoute>
            <CampaignForm />
          </PrivateRoute>
        }
      />

      <Route
        path="/utms"
        element={
          <PrivateRoute>
            <UtmList />
          </PrivateRoute>
        }
      />

      <Route
        path="/utms/new"
        element={
          <PrivateRoute>
            <UtmForm />
          </PrivateRoute>
        }
      />

      <Route
        path="/utms/:id"
        element={
          <PrivateRoute>
            <UtmForm />
          </PrivateRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <AnalyticsDashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <PrivateRoute>
            <PaymentPlatformSettings />
          </PrivateRoute>
        }
      />
    </Routes>
  );
} 