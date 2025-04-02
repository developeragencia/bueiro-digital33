import { useState, useCallback } from 'react';

interface ModalOptions {
  onClose?: () => void;
  onConfirm?: () => void;
  data?: any;
}

interface ModalState extends ModalOptions {
  isOpen: boolean;
}

export function useModal(defaultOptions?: ModalOptions) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    ...defaultOptions,
  });

  const open = useCallback((options?: ModalOptions) => {
    setModalState({
      isOpen: true,
      ...defaultOptions,
      ...options,
    });
  }, [defaultOptions]);

  const close = useCallback(() => {
    setModalState(prev => {
      prev.onClose?.();
      return { ...prev, isOpen: false };
    });
  }, []);

  const confirm = useCallback(() => {
    setModalState(prev => {
      prev.onConfirm?.();
      return { ...prev, isOpen: false };
    });
  }, []);

  const setData = useCallback((data: any) => {
    setModalState(prev => ({ ...prev, data }));
  }, []);

  return {
    isOpen: modalState.isOpen,
    data: modalState.data,
    open,
    close,
    confirm,
    setData,
  };
} 