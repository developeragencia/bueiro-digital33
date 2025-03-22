import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

export function useForm<T extends z.ZodType>(schema: T) {
  return useReactHookForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: 'onChange'
  });
}