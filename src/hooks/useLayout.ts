import { useState, useEffect } from 'react';
import { useTheme } from './useTheme';
import { useMediaQuery } from './useMediaQuery';

interface LayoutConfig {
  sidebarOpen: boolean;
  isMobile: boolean;
  isDark: boolean;
}

export function useLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isDark } = useTheme();

  useEffect(() => {
    if (!isMobile && !sidebarOpen) {
      setSidebarOpen(true);
    } else if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  const config: LayoutConfig = {
    sidebarOpen,
    isMobile,
    isDark,
  };

  return {
    config,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };
} 