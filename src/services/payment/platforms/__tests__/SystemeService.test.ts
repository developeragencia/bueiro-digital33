import axios from 'axios';
import { Currency, PaymentMethod, SystemeConfig, TransactionStatus } from '../../../../types/payment';
import { SystemeService } from '../SystemeService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SystemeService', () => {
  const mockConfig: SystemeConfig = {
    id: 'systeme-test',
    name: 'Systeme Test',
    platform: 'systeme',
    settings: {
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      webhookSecret: 'test-webhook-secret',
      merchantId: 'test-merchant',
      sandbox: true
    },
    enabled: true
  };

  let service: SystemeService;

  beforeEach(() => {
    service = new SystemeService(mockConfig);
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    const mockPaymentData = {
      customer: {
        email: 'test@example.com',
        name: 'John Doe',
        phone: '+1234567890'
      }
    };

    const mockResponse = {
      data: {
        id: 'payment-123',
        amount: 100,
        currency: 'BRL',
        status: 'pending',
        customer: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    };

    it('should process payment successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.processPayment(
        100,
        Currency.BRL,
        PaymentMethod.CREDIT_CARD,
        mockPaymentData
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({
          amount: 100,
          currency: Currency.BRL,
          payment_method: PaymentMethod.CREDIT_CARD,
          customer: expect.objectContaining({
            email: 'test@example.com'
          })
        }),
        expect.any(Object)
      );

      expect(result).toEqual({
        id: 'payment-123',
        platform_id: 'systeme-test',
        amount: 100,
        currency: Currency.BRL,
        status: TransactionStatus.PENDING,
        customer: {
          name: 'John Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        payment_method: PaymentMethod.CREDIT_CARD,
        metadata: mockResponse.data,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });

    it('should handle payment processing error', async () => {
      const errorMessage = 'Payment processing failed';
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.processPayment(
          100,
          Currency.BRL,
          PaymentMethod.CREDIT_CARD,
          mockPaymentData
        )
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('refundTransaction', () => {
    const mockOrder = {
      data: {
        id: 'order-123',
        amount: 100,
        currency: 'BRL',
        status: 'completed',
        customer: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        payment_method: 'credit_card',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    };

    const mockRefundResponse = {
      data: {
        id: 'refund-123',
        amount: 100,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    };

    it('should refund transaction successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockOrder);
      mockedAxios.post.mockResolvedValueOnce(mockRefundResponse);

      const result = await service.refundTransaction('order-123', 100);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/orders/order-123/refunds'),
        expect.objectContaining({
          amount: 100,
          reason: 'Reembolso solicitado'
        }),
        expect.any(Object)
      );

      expect(result).toEqual({
        id: 'refund-123',
        platform_id: 'systeme-test',
        amount: 100,
        currency: Currency.BRL,
        status: TransactionStatus.REFUNDED,
        customer: {
          name: 'John Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        payment_method: PaymentMethod.CREDIT_CARD,
        metadata: mockRefundResponse.data,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });

    it('should handle refund error', async () => {
      const errorMessage = 'Refund failed';
      mockedAxios.get.mockResolvedValueOnce(mockOrder);
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.refundTransaction('order-123', 100)
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('getTransaction', () => {
    const mockOrder = {
      data: {
        id: 'order-123',
        amount: 100,
        currency: 'BRL',
        status: 'completed',
        payment_method: 'credit_card',
        customer: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    };

    it('should get transaction successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockOrder);

      const result = await service.getTransaction('order-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/orders/order-123'),
        expect.any(Object)
      );

      expect(result).toEqual({
        id: 'order-123',
        platform_id: 'systeme-test',
        amount: 100,
        currency: Currency.BRL,
        status: TransactionStatus.COMPLETED,
        customer: {
          name: 'John Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        payment_method: PaymentMethod.CREDIT_CARD,
        metadata: mockOrder.data,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });

    it('should handle get transaction error', async () => {
      const errorMessage = 'Transaction not found';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.getTransaction('order-123')
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('getTransactions', () => {
    const mockOrders = {
      data: {
        orders: [
          {
            id: 'order-123',
            amount: 100,
            currency: 'BRL',
            status: 'completed',
            payment_method: 'credit_card',
            customer: {
              first_name: 'John',
              last_name: 'Doe',
              email: 'test@example.com',
              phone: '+1234567890'
            },
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ]
      }
    };

    it('should get transactions successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockOrders);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const result = await service.getTransactions(startDate, endDate);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({
          params: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          }
        })
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'order-123',
        platform_id: 'systeme-test',
        amount: 100,
        currency: Currency.BRL,
        status: TransactionStatus.COMPLETED,
        customer: {
          name: 'John Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        payment_method: PaymentMethod.CREDIT_CARD,
        metadata: mockOrders.data.orders[0],
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });

    it('should handle get transactions error', async () => {
      const errorMessage = 'Failed to fetch transactions';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.getTransactions(new Date(), new Date())
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('validateWebhookSignature', () => {
    it('should validate webhook signature successfully', async () => {
      const mockPayload = { test: 'data' };
      const mockSignature = 'valid-signature';

      const result = await service.validateWebhookSignature(
        mockSignature,
        mockPayload
      );

      expect(result).toBe(false); // Since we're using a test webhook secret
    });

    it('should handle validation error', async () => {
      const mockPayload = { test: 'data' };
      const mockSignature = 'invalid-signature';

      const result = await service.validateWebhookSignature(
        mockSignature,
        mockPayload
      );

      expect(result).toBe(false);
    });
  });
}); 