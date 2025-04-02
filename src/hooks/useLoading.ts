import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';

export function useLoading<T extends (...args: any[]) => Promise<any>>(
  callback: T
): [(...args: Parameters<T>) => ReturnType<T>, boolean] {
  const [loading, setLoading] = useState(false);
  const notification = useNotification();

  const wrappedCallback = useCallback(
    async (...args: Parameters<T>) => {
      try {
        setLoading(true);
        const result = await callback(...args);
        return result;
      } catch (error) {
        notification.error(error instanceof Error ? error.message : 'Ocorreu um erro inesperado');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [callback, notification]
  );

  return [wrappedCallback, loading];
} 