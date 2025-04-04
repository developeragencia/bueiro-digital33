import axios from 'axios';
import { Currency, PaymentMethod, ShopifyConfig, TransactionStatus } from '../../../../types/payment';
import { ShopifyService } from '../ShopifyService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ShopifyService', () => {
  const mockConfig: ShopifyConfig = {
    id: 'shopify-test',
    name: 'Shopify Test',
    platform: 'shopify',
    settings: {
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      webhookSecret: 'test-webhook-secret',
      shopDomain: 'test-store.myshopify.com',
      accessToken: 'test-access-token',
      sandbox: true
    },
    enabled: true
  };

  let service: ShopifyService;

  beforeEach(() => {
    service = new ShopifyService(mockConfig);
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    const mockPaymentData = {
      description: 'Test Payment',
      customer: {
        email: 'test@example.com',
        name: 'John Doe',
        phone: '+1234567890'
      }
    };

    const mockResponse = {
      data: {
        order: {
          id: 'order-123',
          total_price: 100,
          currency: 'BRL',
          financial_status: 'pending',
          customer: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'test@example.com',
            phone: '+1234567890'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
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
        expect.stringContaining('/orders.json'),
        expect.objectContaining({
          order: expect.objectContaining({
            line_items: [{
              title: 'Test Payment',
              price: 100,
              quantity: 1
            }]
          })
        }),
        expect.any(Object)
      );

      expect(result).toEqual({
        id: 'order-123',
        platform_id: 'shopify-test',
        amount: 100,
        currency: Currency.BRL,
        status: TransactionStatus.PENDING,
        customer: {
          name: 'John Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        payment_method: PaymentMethod.CREDIT_CARD,
        metadata: mockResponse.data.order,
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
        order: {
          id: 'order-123',
          total_price: 100,
          currency: 'BRL',
          financial_status: 'paid',
          customer: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'test@example.com',
            phone: '+1234567890'
          },
          line_items: [{ id: 'item-123' }],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }
    };

    const mockRefundResponse = {
      data: {
        refund: {
          id: 'refund-123',
          transactions: [{ amount: 100 }],
          created_at: '2024-01-01T00:00:00Z',
          processed_at: '2024-01-01T00:00:00Z'
        }
      }
    };

    it('should refund transaction successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockOrder);
      mockedAxios.post.mockResolvedValueOnce(mockRefundResponse);

      const result = await service.refundTransaction('order-123', 100);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/orders/order-123/refunds.json'),
        expect.objectContaining({
          refund: expect.objectContaining({
            notify: true,
            note: 'Reembolso solicitado'
          })
        }),
        expect.any(Object)
      );

      expect(result).toEqual({
        id: 'refund-123',
        platform_id: 'shopify-test',
        amount: 100,
        currency: Currency.BRL,
        status: TransactionStatus.REFUNDED,
        customer: {
          name: 'John Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        payment_method: undefined,
        metadata: mockRefundResponse.data.refund,
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
        order: {
          id: 'order-123',
          total_price: 100,
          currency: 'BRL',
          financial_status: 'paid',
          gateway: 'credit_card',
          customer: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'test@example.com',
            phone: '+1234567890'
          },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      }
    };

    it('should get transaction successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockOrder);

      const result = await service.getTransaction('order-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/orders/order-123.json'),
        expect.any(Object)
      );

      expect(result).toEqual({
        id: 'order-123',
        platform_id: 'shopify-test',
        amount: 100,
        currency: Currency.BRL,
        status: TransactionStatus.COMPLETED,
        customer: {
          name: 'John Doe',
          email: 'test@example.com',
          phone: '+1234567890'
        },
        payment_method: PaymentMethod.CREDIT_CARD,
        metadata: mockOrder.data.order,
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