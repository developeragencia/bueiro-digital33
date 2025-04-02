import { useState, useCallback } from 'react';
import { useToast } from '../lib/hooks/use-toast';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const toast = useToast();

  const execute = useCallback(
    async (promise: Promise<T>, successMessage?: string, errorMessage?: string) => {
      try {
        setState({ data: null, loading: true, error: null });
        const data = await promise;
        setState({ data, loading: false, error: null });
        if (successMessage) {
          toast.success(successMessage);
        }
        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('An error occurred');
        setState({ data: null, loading: false, error: errorObj });
        if (errorMessage) {
          toast.error(errorMessage);
        }
        throw error;
      }
    },
    [toast]
  );

  return {
    ...state,
    execute,
  };
} 