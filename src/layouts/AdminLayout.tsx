import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import AdminNavbar from '../components/layout/AdminNavbar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 