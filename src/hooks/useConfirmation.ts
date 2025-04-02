import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
}

export function useConfirmation() {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    onConfirm: () => {},
  });

  const confirm = useCallback((options: ConfirmationOptions) => {
    setConfirmation({
      ...options,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      isOpen: true,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    try {
      await confirmation.onConfirm();
    } finally {
      setConfirmation(prev => ({ ...prev, isOpen: false }));
    }
  }, [confirmation.onConfirm]);

  const handleCancel = useCallback(() => {
    confirmation.onCancel?.();
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  }, [confirmation.onCancel]);

  const handleClose = useCallback(() => {
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    confirmation,
    confirm,
    handleConfirm,
    handleCancel,
    handleClose,
  };
} 