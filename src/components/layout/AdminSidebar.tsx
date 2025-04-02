import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminSidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin/dashboard"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/admin/settings"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
} 