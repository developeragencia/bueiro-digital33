import { useEffect } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [theme, setTheme, removeTheme] = useLocalStorage<Theme>('theme', 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
  }, [theme, prefersDark]);

  const toggleTheme = () => {
    setTheme(current => {
      if (current === 'system') return 'light';
      if (current === 'light') return 'dark';
      return 'system';
    });
  };

  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
    removeTheme,
  };
} 