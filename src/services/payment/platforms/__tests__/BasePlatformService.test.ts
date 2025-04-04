import { AxiosError } from 'axios';
import { Currency, PaymentMethod, PlatformConfig, TransactionStatus } from '../../../../types/payment';
import { BasePlatformService } from '../BasePlatformService';

class TestPlatformService extends BasePlatformService {
  constructor(config: PlatformConfig) {
    super(config);
  }

  async processPayment() {
    throw new Error('Method not implemented.');
  }

  async refundTransaction() {
    throw new Error('Method not implemented.');
  }

  async getTransaction() {
    throw new Error('Method not implemented.');
  }

  async getTransactions() {
    throw new Error('Method not implemented.');
  }

  async getStatus() {
    throw new Error('Method not implemented.');
  }

  async cancelTransaction() {
    throw new Error('Method not implemented.');
  }

  async validateWebhookSignature() {
    throw new Error('Method not implemented.');
  }

  protected getSandboxApiUrl(): string {
    return 'https://sandbox.test.com';
  }

  protected getProductionApiUrl(): string {
    return 'https://api.test.com';
  }

  // Expose protected methods for testing
  public exposeGetBaseUrl(): string {
    return this.getBaseUrl();
  }

  public exposeGetHeaders(): Record<string, string> {
    return this.getHeaders();
  }

  public exposeHandleError(error: unknown): Error {
    return this.handleError(error);
  }

  public exposeValidatePaymentData(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): void {
    return this.validatePaymentData(amount, currency, paymentMethod, paymentData);
  }

  public exposeMapStatus(status: string): TransactionStatus {
    return this.mapStatus(status);
  }
}

describe('BasePlatformService', () => {
  const mockConfig: PlatformConfig = {
    id: 'test-platform',
    name: 'Test Platform',
    platform: 'shopify',
    settings: {
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      webhookSecret: 'test-webhook-secret',
      sandbox: true
    },
    enabled: true
  };

  let service: TestPlatformService;

  beforeEach(() => {
    service = new TestPlatformService(mockConfig);
  });

  describe('getBaseUrl', () => {
    it('should return sandbox URL when sandbox is true', () => {
      expect(service.exposeGetBaseUrl()).toBe('https://sandbox.test.com');
    });

    it('should return production URL when sandbox is false', () => {
      const prodConfig = {
        ...mockConfig,
        settings: { ...mockConfig.settings, sandbox: false }
      };
      service = new TestPlatformService(prodConfig);
      expect(service.exposeGetBaseUrl()).toBe('https://api.test.com');
    });
  });

  describe('getHeaders', () => {
    it('should return correct headers', () => {
      const headers = service.exposeGetHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-api-key',
        'X-Platform-Id': 'test-platform'
      });
    });
  });

  describe('handleError', () => {
    it('should handle Axios errors with different status codes', () => {
      const mockAxiosError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: { message: 'Bad Request' }
        }
      } as AxiosError;

      const error = service.exposeHandleError(mockAxiosError);
      expect(error.message).toBe('Requisição inválida: Bad Request');
    });

    it('should handle non-Axios errors', () => {
      const error = service.exposeHandleError(new Error('Test error'));
      expect(error.message).toBe('Test error');
    });

    it('should handle unknown errors', () => {
      const error = service.exposeHandleError('Unknown error');
      expect(error.message).toBe('Erro desconhecido');
    });
  });

  describe('validatePaymentData', () => {
    const validPaymentData = {
      customer: {
        email: 'test@example.com'
      }
    };

    it('should validate payment data successfully', () => {
      expect(() => {
        service.exposeValidatePaymentData(
          100,
          Currency.BRL,
          PaymentMethod.CREDIT_CARD,
          validPaymentData
        );
      }).not.toThrow();
    });

    it('should throw error for invalid amount', () => {
      expect(() => {
        service.exposeValidatePaymentData(
          0,
          Currency.BRL,
          PaymentMethod.CREDIT_CARD,
          validPaymentData
        );
      }).toThrow('O valor do pagamento deve ser maior que zero');
    });

    it('should throw error for invalid currency', () => {
      expect(() => {
        service.exposeValidatePaymentData(
          100,
          'INVALID' as Currency,
          PaymentMethod.CREDIT_CARD,
          validPaymentData
        );
      }).toThrow('Moeda inválida');
    });

    it('should throw error for invalid payment method', () => {
      expect(() => {
        service.exposeValidatePaymentData(
          100,
          Currency.BRL,
          'INVALID' as PaymentMethod,
          validPaymentData
        );
      }).toThrow('Método de pagamento inválido');
    });

    it('should throw error for missing customer email', () => {
      expect(() => {
        service.exposeValidatePaymentData(
          100,
          Currency.BRL,
          PaymentMethod.CREDIT_CARD,
          { customer: {} }
        );
      }).toThrow('E-mail do cliente é obrigatório');
    });
  });

  describe('mapStatus', () => {
    it('should map known status correctly', () => {
      expect(service.exposeMapStatus('pending')).toBe(TransactionStatus.PENDING);
      expect(service.exposeMapStatus('completed')).toBe(TransactionStatus.COMPLETED);
      expect(service.exposeMapStatus('failed')).toBe(TransactionStatus.FAILED);
    });

    it('should map unknown status to PENDING', () => {
      expect(service.exposeMapStatus('unknown')).toBe(TransactionStatus.PENDING);
    });

    it('should be case insensitive', () => {
      expect(service.exposeMapStatus('COMPLETED')).toBe(TransactionStatus.COMPLETED);
      expect(service.exposeMapStatus('Pending')).toBe(TransactionStatus.PENDING);
    });
  });
}); 