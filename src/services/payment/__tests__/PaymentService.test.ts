import { Currency, PaymentMethod, PlatformConfig, Transaction, TransactionStatus } from '../../../types/payment';
import { PaymentService } from '../PaymentService';
import { ShopifyService } from '../platforms/ShopifyService';
import { SystemeService } from '../platforms/SystemeService';
import { StrivPayService } from '../platforms/StrivPayService';

jest.mock('../platforms/ShopifyService');
jest.mock('../platforms/SystemeService');
jest.mock('../platforms/StrivPayService');

describe('PaymentService', () => {
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

  const mockTransaction: Transaction = {
    id: 'test-transaction',
    platform_id: 'test-platform',
    amount: 100,
    currency: Currency.BRL,
    status: TransactionStatus.COMPLETED,
    customer: {
      name: 'John Doe',
      email: 'test@example.com'
    },
    payment_method: PaymentMethod.CREDIT_CARD,
    created_at: new Date(),
    updated_at: new Date()
  };

  let service: PaymentService;
  let mockShopifyService: jest.Mocked<ShopifyService>;
  let mockSystemeService: jest.Mocked<SystemeService>;
  let mockStrivPayService: jest.Mocked<StrivPayService>;

  beforeEach(() => {
    mockShopifyService = new ShopifyService(mockConfig) as jest.Mocked<ShopifyService>;
    mockSystemeService = new SystemeService(mockConfig) as jest.Mocked<SystemeService>;
    mockStrivPayService = new StrivPayService(mockConfig) as jest.Mocked<StrivPayService>;

    service = new PaymentService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process payment with Shopify', async () => {
      mockShopifyService.processPayment.mockResolvedValueOnce(mockTransaction);

      const result = await service.processPayment(
        'shopify',
        100,
        Currency.BRL,
        PaymentMethod.CREDIT_CARD,
        { customer: { email: 'test@example.com' } }
      );

      expect(result).toEqual(mockTransaction);
      expect(mockShopifyService.processPayment).toHaveBeenCalledWith(
        100,
        Currency.BRL,
        PaymentMethod.CREDIT_CARD,
        expect.objectContaining({
          customer: expect.objectContaining({
            email: 'test@example.com'
          })
        })
      );
    });

    it('should process payment with Systeme', async () => {
      mockSystemeService.processPayment.mockResolvedValueOnce(mockTransaction);

      const result = await service.processPayment(
        'systeme',
        100,
        Currency.BRL,
        PaymentMethod.CREDIT_CARD,
        { customer: { email: 'test@example.com' } }
      );

      expect(result).toEqual(mockTransaction);
      expect(mockSystemeService.processPayment).toHaveBeenCalledWith(
        100,
        Currency.BRL,
        PaymentMethod.CREDIT_CARD,
        expect.objectContaining({
          customer: expect.objectContaining({
            email: 'test@example.com'
          })
        })
      );
    });

    it('should process payment with StrivPay', async () => {
      mockStrivPayService.processPayment.mockResolvedValueOnce(mockTransaction);

      const result = await service.processPayment(
        'strivpay',
        100,
        Currency.BRL,
        PaymentMethod.CREDIT_CARD,
        { customer: { email: 'test@example.com' } }
      );

      expect(result).toEqual(mockTransaction);
      expect(mockStrivPayService.processPayment).toHaveBeenCalledWith(
        100,
        Currency.BRL,
        PaymentMethod.CREDIT_CARD,
        expect.objectContaining({
          customer: expect.objectContaining({
            email: 'test@example.com'
          })
        })
      );
    });

    it('should throw error for invalid platform', async () => {
      await expect(
        service.processPayment(
          'invalid' as any,
          100,
          Currency.BRL,
          PaymentMethod.CREDIT_CARD,
          { customer: { email: 'test@example.com' } }
        )
      ).rejects.toThrow('Plataforma de pagamento não suportada: invalid');
    });
  });

  describe('refundTransaction', () => {
    it('should refund transaction with Shopify', async () => {
      mockShopifyService.refundTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await service.refundTransaction('shopify', 'test-transaction', 100);

      expect(result).toEqual(mockTransaction);
      expect(mockShopifyService.refundTransaction).toHaveBeenCalledWith(
        'test-transaction',
        100
      );
    });

    it('should refund transaction with Systeme', async () => {
      mockSystemeService.refundTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await service.refundTransaction('systeme', 'test-transaction', 100);

      expect(result).toEqual(mockTransaction);
      expect(mockSystemeService.refundTransaction).toHaveBeenCalledWith(
        'test-transaction',
        100
      );
    });

    it('should refund transaction with StrivPay', async () => {
      mockStrivPayService.refundTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await service.refundTransaction('strivpay', 'test-transaction', 100);

      expect(result).toEqual(mockTransaction);
      expect(mockStrivPayService.refundTransaction).toHaveBeenCalledWith(
        'test-transaction',
        100
      );
    });

    it('should throw error for invalid platform', async () => {
      await expect(
        service.refundTransaction('invalid' as any, 'test-transaction', 100)
      ).rejects.toThrow('Plataforma de pagamento não suportada: invalid');
    });
  });

  describe('getTransaction', () => {
    it('should get transaction from Shopify', async () => {
      mockShopifyService.getTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await service.getTransaction('shopify', 'test-transaction');

      expect(result).toEqual(mockTransaction);
      expect(mockShopifyService.getTransaction).toHaveBeenCalledWith('test-transaction');
    });

    it('should get transaction from Systeme', async () => {
      mockSystemeService.getTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await service.getTransaction('systeme', 'test-transaction');

      expect(result).toEqual(mockTransaction);
      expect(mockSystemeService.getTransaction).toHaveBeenCalledWith('test-transaction');
    });

    it('should get transaction from StrivPay', async () => {
      mockStrivPayService.getTransaction.mockResolvedValueOnce(mockTransaction);

      const result = await service.getTransaction('strivpay', 'test-transaction');

      expect(result).toEqual(mockTransaction);
      expect(mockStrivPayService.getTransaction).toHaveBeenCalledWith('test-transaction');
    });

    it('should throw error for invalid platform', async () => {
      await expect(
        service.getTransaction('invalid' as any, 'test-transaction')
      ).rejects.toThrow('Plataforma de pagamento não suportada: invalid');
    });
  });

  describe('getTransactions', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    it('should get transactions from Shopify', async () => {
      mockShopifyService.getTransactions.mockResolvedValueOnce([mockTransaction]);

      const result = await service.getTransactions('shopify', startDate, endDate);

      expect(result).toEqual([mockTransaction]);
      expect(mockShopifyService.getTransactions).toHaveBeenCalledWith(startDate, endDate);
    });

    it('should get transactions from Systeme', async () => {
      mockSystemeService.getTransactions.mockResolvedValueOnce([mockTransaction]);

      const result = await service.getTransactions('systeme', startDate, endDate);

      expect(result).toEqual([mockTransaction]);
      expect(mockSystemeService.getTransactions).toHaveBeenCalledWith(startDate, endDate);
    });

    it('should get transactions from StrivPay', async () => {
      mockStrivPayService.getTransactions.mockResolvedValueOnce([mockTransaction]);

      const result = await service.getTransactions('strivpay', startDate, endDate);

      expect(result).toEqual([mockTransaction]);
      expect(mockStrivPayService.getTransactions).toHaveBeenCalledWith(startDate, endDate);
    });

    it('should throw error for invalid platform', async () => {
      await expect(
        service.getTransactions('invalid' as any, startDate, endDate)
      ).rejects.toThrow('Plataforma de pagamento não suportada: invalid');
    });
  });

  describe('validateWebhookSignature', () => {
    const mockPayload = { test: 'data' };
    const mockSignature = 'test-signature';

    it('should validate webhook signature for Shopify', async () => {
      mockShopifyService.validateWebhookSignature.mockResolvedValueOnce(true);

      const result = await service.validateWebhookSignature(
        'shopify',
        mockSignature,
        mockPayload
      );

      expect(result).toBe(true);
      expect(mockShopifyService.validateWebhookSignature).toHaveBeenCalledWith(
        mockSignature,
        mockPayload
      );
    });

    it('should validate webhook signature for Systeme', async () => {
      mockSystemeService.validateWebhookSignature.mockResolvedValueOnce(true);

      const result = await service.validateWebhookSignature(
        'systeme',
        mockSignature,
        mockPayload
      );

      expect(result).toBe(true);
      expect(mockSystemeService.validateWebhookSignature).toHaveBeenCalledWith(
        mockSignature,
        mockPayload
      );
    });

    it('should validate webhook signature for StrivPay', async () => {
      mockStrivPayService.validateWebhookSignature.mockResolvedValueOnce(true);

      const result = await service.validateWebhookSignature(
        'strivpay',
        mockSignature,
        mockPayload
      );

      expect(result).toBe(true);
      expect(mockStrivPayService.validateWebhookSignature).toHaveBeenCalledWith(
        mockSignature,
        mockPayload
      );
    });

    it('should throw error for invalid platform', async () => {
      await expect(
        service.validateWebhookSignature('invalid' as any, mockSignature, mockPayload)
      ).rejects.toThrow('Plataforma de pagamento não suportada: invalid');
    });
  });
}); 