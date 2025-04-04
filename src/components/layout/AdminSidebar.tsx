import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/payments', label: 'Pagamentos', icon: '💳' },
    { path: '/admin/settings', label: 'Configurações', icon: '⚙️' },
    { path: '/admin/users', label: 'Usuários', icon: '👥' },
    { path: '/admin/reports', label: 'Relatórios', icon: '📈' }
  ];

  return (
    <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Bueiro Digital</h1>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700',
              location.pathname === item.path && 'bg-gray-700'
            )}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}; 