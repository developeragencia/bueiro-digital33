import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

interface Route {
  path: string;
  isProtected: boolean;
  title: string;
}

const routes: Route[] = [
  { path: '/', isProtected: false, title: 'Home' },
  { path: '/login', isProtected: false, title: 'Login' },
  { path: '/register', isProtected: false, title: 'Registro' },
  { path: '/dashboard', isProtected: true, title: 'Dashboard' },
  { path: '/campaigns', isProtected: true, title: 'Campanhas' },
  { path: '/campaigns/new', isProtected: true, title: 'Nova Campanha' },
  { path: '/campaigns/:id', isProtected: true, title: 'Detalhes da Campanha' },
  { path: '/campaigns/:id/edit', isProtected: true, title: 'Editar Campanha' },
  { path: '/utms', isProtected: true, title: 'UTMs' },
  { path: '/utms/new', isProtected: true, title: 'Novo UTM' },
  { path: '/utms/:id', isProtected: true, title: 'Detalhes do UTM' },
  { path: '/utms/:id/edit', isProtected: true, title: 'Editar UTM' },
  { path: '/analytics', isProtected: true, title: 'Analytics' },
  { path: '/settings', isProtected: true, title: 'Configurações' },
  { path: '/profile', isProtected: true, title: 'Perfil' },
];

export function useRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitialized } = useAuth();

  const getCurrentRoute = (): Route | undefined => {
    return routes.find(route => {
      if (route.path === location.pathname) return true;
      if (route.path.includes(':')) {
        const routeParts = route.path.split('/');
        const pathParts = location.pathname.split('/');
        if (routeParts.length !== pathParts.length) return false;
        return routeParts.every((part, i) => part.startsWith(':') || part === pathParts[i]);
      }
      return false;
    });
  };

  const isPublicRoute = (path: string): boolean => {
    const route = routes.find(r => r.path === path);
    return route ? !route.isProtected : false;
  };

  const redirectToLogin = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const redirectToDashboard = () => {
    navigate('/dashboard');
  };

  const redirectBack = () => {
    const from = location.state?.from || '/dashboard';
    navigate(from);
  };

  const checkAuth = () => {
    if (!isInitialized) return;

    const currentRoute = getCurrentRoute();
    if (!currentRoute) return;

    if (currentRoute.isProtected && !user) {
      redirectToLogin();
    } else if (!currentRoute.isProtected && user && location.pathname !== '/') {
      redirectToDashboard();
    }
  };

  return {
    routes,
    getCurrentRoute,
    isPublicRoute,
    redirectToLogin,
    redirectToDashboard,
    redirectBack,
    checkAuth,
  };
} 