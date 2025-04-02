import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useRoutes } from './useRoutes';

interface Breadcrumb {
  path: string;
  label: string;
  isLast: boolean;
}

export function useBreadcrumb() {
  const location = useLocation();
  const { routes } = useRoutes();

  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let currentPath = '';

    return pathSegments.map((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Tenta encontrar uma rota correspondente
      const matchingRoute = routes.find(route => {
        const routeSegments = route.path.split('/').filter(Boolean);
        if (routeSegments.length !== index + 1) return false;

        return routeSegments.every((routeSegment, i) => {
          if (routeSegment.startsWith(':')) return true;
          return routeSegment === pathSegments[i];
        });
      });

      // Se encontrou uma rota, usa o título dela
      if (matchingRoute) {
        return {
          path: currentPath,
          label: matchingRoute.title,
          isLast,
        };
      }

      // Caso contrário, formata o segmento para exibição
      return {
        path: currentPath,
        label: segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        isLast,
      };
    });
  }, [location.pathname, routes]);

  return {
    breadcrumbs,
    currentPath: location.pathname,
  };
} 