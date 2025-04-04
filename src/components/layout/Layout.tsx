import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAdmin, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800">Bueiro Digital</h1>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  <span>Dashboard</span>
                </Link>
              </li>
              
              {isAdmin && (
                <>
                  <li>
                    <Link 
                      to="/settings" 
                      className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <span>Configurações</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/settings/payment-platforms" 
                      className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <span>Plataformas de Pagamento</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}; 