import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  isActive?: boolean;
  isVisible?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'home',
  },
  {
    id: 'campaigns',
    label: 'Campanhas',
    path: '/campaigns',
    icon: 'campaign',
    children: [
      {
        id: 'campaigns-list',
        label: 'Lista de Campanhas',
        path: '/campaigns',
      },
      {
        id: 'campaigns-new',
        label: 'Nova Campanha',
        path: '/campaigns/new',
      },
    ],
  },
  {
    id: 'utms',
    label: 'UTMs',
    path: '/utms',
    icon: 'link',
    children: [
      {
        id: 'utms-list',
        label: 'Lista de UTMs',
        path: '/utms',
      },
      {
        id: 'utms-new',
        label: 'Novo UTM',
        path: '/utms/new',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'analytics',
  },
  {
    id: 'settings',
    label: 'Configurações',
    path: '/settings',
    icon: 'settings',
  },
];

export function useMenu() {
  const location = useLocation();
  const { user } = useAuth();

  const processedMenuItems = useMemo(() => {
    const processItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        const isActive =
          location.pathname === item.path ||
          (item.children?.some(child => location.pathname === child.path) ?? false);

        const isVisible = user !== null;

        const children = item.children ? processItems(item.children) : undefined;

        return {
          ...item,
          isActive,
          isVisible,
          children,
        };
      });
    };

    return processItems(menuItems);
  }, [location.pathname, user]);

  const activeItem = useMemo(() => {
    const findActiveItem = (items: MenuItem[]): MenuItem | undefined => {
      for (const item of items) {
        if (item.isActive) return item;
        if (item.children) {
          const activeChild = findActiveItem(item.children);
          if (activeChild) return activeChild;
        }
      }
      return undefined;
    };

    return findActiveItem(processedMenuItems);
  }, [processedMenuItems]);

  const visibleItems = useMemo(() => {
    return processedMenuItems.filter(item => item.isVisible);
  }, [processedMenuItems]);

  return {
    items: visibleItems,
    activeItem,
  };
} 