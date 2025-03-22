import { type FC } from 'react';
import { Outlet, useLocation, Link, Navigate } from 'react-router-dom';
import { 
  Settings, 
  Link as LinkIcon, 
  Copy, 
  Home,
  DollarSign,
  Percent,
  FileText,
  ArrowLeft,
  BarChart3,
  Menu,
  X,
  Settings as SettingsIcon
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import UserMenu from './UserMenu';

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  adminOnly?: boolean;
  onClick?: () => void;
}

const NavItem: FC<NavItemProps> = ({ icon, text, to, adminOnly = false, onClick }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isActive = location.pathname === to;

  if (adminOnly && !isAdmin) return null;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

const Layout: FC = () => {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const pageTitle = location.pathname === '/dashboard'
    ? 'Dashboard Principal'
    : location.pathname.slice(1).charAt(0).toUpperCase() + location.pathname.slice(2);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50 transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <Logo showLink={true} />
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <NavItem icon={<Home size={20} />} text="Dashboard" to="/dashboard" onClick={closeMobileMenu} />
            <NavItem icon={<BarChart3 size={20} />} text="Campanhas" to="/campanhas" onClick={closeMobileMenu} />
            <NavItem icon={<LinkIcon size={20} />} text="UTMs" to="/utms" onClick={closeMobileMenu} />
            <NavItem icon={<Settings size={20} />} text="Integrações" to="/integracoes" adminOnly onClick={closeMobileMenu} />
            <NavItem icon={<Copy size={20} />} text="Regras" to="/regras" adminOnly onClick={closeMobileMenu} />
            <NavItem icon={<Percent size={20} />} text="Taxas" to="/taxas" adminOnly onClick={closeMobileMenu} />
            <NavItem icon={<DollarSign size={20} />} text="Despesas" to="/despesas" adminOnly onClick={closeMobileMenu} />
            <NavItem icon={<FileText size={20} />} text="Relatórios" to="/relatorios" onClick={closeMobileMenu} />
            {isAdmin && (
              <NavItem icon={<SettingsIcon size={20} />} text="Configurações" to="/configuracoes" adminOnly onClick={closeMobileMenu} />
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 h-16 bg-white border-b border-gray-200">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4 ml-12 lg:ml-0">
              <Link 
                to="/"
                className="hidden lg:flex items-center text-gray-600 hover:text-gray-900 transition-all duration-300 group"
              >
                <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                <span>Voltar para Home</span>
              </Link>
              <span className="hidden lg:block text-gray-300">|</span>
              <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>
            </div>

            <UserMenu />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;