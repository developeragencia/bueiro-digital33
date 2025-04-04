import { useState, useCallback } from 'react';
import { useToast } from '../lib/hooks/use-toast';

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Texto copiado com sucesso!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Erro ao copiar texto');
    }
  }, [toast]);

  return {
    copied,
    copyToClipboard,
  };
} 