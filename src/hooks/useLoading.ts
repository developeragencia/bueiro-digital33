import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';

type AsyncFunction<T, A extends any[]> = (...args: A) => Promise<T>;

export function useLoading<T, A extends any[]>(
  asyncFn: AsyncFunction<T, A>
): [AsyncFunction<T, A>, boolean] {
  const [isLoading, setIsLoading] = useState(false);
  const notification = useNotification();

  const wrappedFn = useCallback(
    async (...args: A): Promise<T> => {
      try {
        setIsLoading(true);
        const result = await asyncFn(...args);
        return result;
      } catch (error) {
        notification.error(error instanceof Error ? error.message : 'Ocorreu um erro inesperado');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFn, notification]
  );

  return [wrappedFn, isLoading];
} 