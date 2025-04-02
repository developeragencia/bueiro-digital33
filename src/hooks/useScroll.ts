import { useState, useEffect, useCallback } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
}

interface ScrollInfo extends ScrollPosition {
  direction: 'up' | 'down' | 'none';
  isAtTop: boolean;
  isAtBottom: boolean;
}

export function useScroll(threshold = 50): ScrollInfo {
  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    x: 0,
    y: 0,
    direction: 'none',
    isAtTop: true,
    isAtBottom: false,
  });

  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const currentScrollX = window.scrollX;
    const direction =
      Math.abs(currentScrollY - lastScrollY) >= threshold
        ? currentScrollY > lastScrollY
          ? 'down'
          : 'up'
        : scrollInfo.direction;

    const isAtTop = currentScrollY <= 0;
    const isAtBottom =
      window.innerHeight + currentScrollY >= document.documentElement.scrollHeight;

    setScrollInfo({
      x: currentScrollX,
      y: currentScrollY,
      direction,
      isAtTop,
      isAtBottom,
    });

    setLastScrollY(currentScrollY);
  }, [lastScrollY, scrollInfo.direction, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return scrollInfo;
} 