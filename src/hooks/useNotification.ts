import { useCallback } from 'react';
import toast, { ToastOptions } from 'react-hot-toast';

interface NotificationOptions extends ToastOptions {
  duration?: number;
}

const defaultOptions: NotificationOptions = {
  duration: 3000,
  position: 'top-right',
};

export function useNotification() {
  const success = useCallback((message: string, options?: NotificationOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  }, []);

  const error = useCallback((message: string, options?: NotificationOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  }, []);

  const info = useCallback((message: string, options?: NotificationOptions) => {
    toast(message, { ...defaultOptions, ...options });
  }, []);

  const loading = useCallback((message: string, options?: NotificationOptions) => {
    return toast.loading(message, { ...defaultOptions, ...options });
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  return {
    success,
    error,
    info,
    loading,
    dismiss,
  };
} 