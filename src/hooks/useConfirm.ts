import { useState } from 'react';

interface UseConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<UseConfirmOptions | null>(null);
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null);

  const confirm = (options: UseConfirmOptions): Promise<boolean> => {
    setOptions(options);
    setIsOpen(true);
    return new Promise((res) => {
      setResolve(() => res);
    });
  };

  const handleConfirm = () => {
    if (resolve) {
      resolve(true);
      setIsOpen(false);
      setOptions(null);
      setResolve(null);
    }
  };

  const handleCancel = () => {
    if (resolve) {
      resolve(false);
      setIsOpen(false);
      setOptions(null);
      setResolve(null);
    }
  };

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
} 