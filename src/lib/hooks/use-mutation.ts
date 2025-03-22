import { useMutation as useReactMutation } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { queryClient } from './use-query-client';

interface UseMutationProps<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  invalidateQueries?: string[];
  successMessage?: string;
  errorMessage?: string;
}

export function useMutation<TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
  invalidateQueries,
  successMessage = 'Operação realizada com sucesso!',
  errorMessage = 'Erro ao realizar operação'
}: UseMutationProps<TData, TVariables>) {
  const toast = useToast();

  return useReactMutation({
    mutationFn,
    onSuccess: async (data) => {
      if (invalidateQueries) {
        await Promise.all(
          invalidateQueries.map(query => queryClient.invalidateQueries({ queryKey: [query] }))
        );
      }
      toast.success(successMessage);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(errorMessage);
      onError?.(error);
    }
  });
}