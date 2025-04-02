import { useEffect } from 'react';
import { useRoutes } from './useRoutes';

const APP_NAME = 'Bueiro Digital';

export function usePageTitle() {
  const { getCurrentRoute } = useRoutes();

  useEffect(() => {
    const currentRoute = getCurrentRoute();
    const title = currentRoute?.title
      ? `${currentRoute.title} | ${APP_NAME}`
      : APP_NAME;

    document.title = title;
  }, [getCurrentRoute]);

  const setCustomTitle = (title: string) => {
    document.title = `${title} | ${APP_NAME}`;
  };

  return {
    setCustomTitle,
  };
} 