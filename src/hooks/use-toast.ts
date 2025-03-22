import { toast } from 'sonner';

export function useToast() {
  return {
    success: (message: string) => {
      toast.success(message);
    },
    error: (message: string) => {
      toast.error(message);
    },
    info: (message: string) => {
      toast.info(message);
    },
    warning: (message: string) => {
      toast.warning(message);
    },
    loading: (message: string) => {
      return toast.loading(message);
    },
    dismiss: (toastId: string) => {
      toast.dismiss(toastId);
    },
    promise: async <T>(
      promise: Promise<T>,
      {
        loading,
        success,
        error,
      }: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, {
        loading,
        success,
        error,
      });
    },
  };
}