import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminNavbar } from './layout/AdminNavbar';
import { AdminSidebar } from './layout/AdminSidebar';

export function Layout() {
  const { isAdmin, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminNavbar />
        <AdminSidebar />
        <main className="py-10 lg:pl-72">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}