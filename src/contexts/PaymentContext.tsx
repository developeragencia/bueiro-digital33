import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaymentService } from '../services/payment/PaymentService';
import { PlatformConfig } from '../types/payment';

interface PaymentContextType {
  paymentService: PaymentService;
  platforms: PlatformConfig[];
  isLoading: boolean;
  error: string | null;
  initializePlatforms: (configs: PlatformConfig[]) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentService] = useState(() => new PaymentService());
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializePlatforms = (configs: PlatformConfig[]) => {
    try {
      setIsLoading(true);
      paymentService.initializeServices(configs);
      setPlatforms(configs);
      setError(null);
    } catch (err) {
      setError('Erro ao inicializar plataformas de pagamento');
      console.error('Error initializing payment platforms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PaymentContext.Provider value={{
      paymentService,
      platforms,
      isLoading,
      error,
      initializePlatforms
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
}; 