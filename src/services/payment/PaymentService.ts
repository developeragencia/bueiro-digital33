import { PaymentPlatform, PaymentPlatformType, PlatformConfig, Transaction } from '../../types/payment';
import { getPlatformService } from './platforms';
import { PaymentPlatformService } from './PaymentPlatformService';
import { TransactionService } from './TransactionService';
import { StatusService } from './StatusService';

export class PaymentService {
  private platformService: PaymentPlatformService;
  private transactionService: typeof TransactionService;
  private statusService: typeof StatusService;

  constructor() {
    this.platformService = new PaymentPlatformService();
    this.transactionService = TransactionService;
    this.statusService = StatusService;
  }

  async getAvailablePlatforms(): Promise<PaymentPlatform[]> {
    return this.platformService.getAvailablePlatforms();
  }

  async getPlatformById(platformId: string): Promise<PaymentPlatform | null> {
    return this.platformService.getById(platformId);
  }

  async getPlatformsByUserId(userId: string): Promise<PaymentPlatform[]> {
    return this.platformService.getByUserId(userId);
  }

  async integratePlatform(platform: PaymentPlatformType, config: PlatformConfig, userId: string): Promise<PaymentPlatform> {
    return this.platformService.integrate(platform, config, userId);
  }

  async updatePlatformConfig(platformId: string, config: Partial<PlatformConfig>): Promise<PaymentPlatform> {
    return this.platformService.updateConfig(platformId, config);
  }

  async deletePlatform(platformId: string): Promise<void> {
    return this.platformService.delete(platformId);
  }

  async processPayment(
    platformId: string,
    amount: number,
    currency: string,
    customer: Transaction['customer'],
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    const platform = await this.getPlatformById(platformId);
    if (!platform) {
      throw new Error('Platform not found');
    }

    const service = getPlatformService(platform.type, {
      apiKey: platform.settings.apiKey,
      secretKey: platform.settings.secretKey,
      sandbox: platform.settings.sandbox || false
    });

    return service.processPayment(amount, currency, customer, metadata);
  }

  async processRefund(platformId: string, transactionId: string): Promise<boolean> {
    const platform = await this.getPlatformById(platformId);
    if (!platform) {
      throw new Error('Platform not found');
    }

    const service = getPlatformService(platform.type, {
      apiKey: platform.settings.apiKey,
      secretKey: platform.settings.secretKey,
      sandbox: platform.settings.sandbox || false
    });

    return service.processRefund(transactionId);
  }

  async validateWebhook(platformId: string, payload: any, signature: string): Promise<boolean> {
    const platform = await this.getPlatformById(platformId);
    if (!platform) {
      throw new Error('Platform not found');
    }

    const service = getPlatformService(platform.type, {
      apiKey: platform.settings.apiKey,
      secretKey: platform.settings.secretKey,
      sandbox: platform.settings.sandbox || false
    });

    return service.validateWebhook(payload, signature);
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    return this.transactionService.getById(transactionId);
  }

  async getTransactionByOrderId(orderId: string): Promise<Transaction | null> {
    return this.transactionService.getByOrderId(orderId);
  }

  async getTransactionsByPlatformId(platformId: string): Promise<Transaction[]> {
    return this.transactionService.getByPlatformId(platformId);
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return this.transactionService.getByUserId(userId);
  }

  async getTransactionsByStatus(status: Transaction['status']): Promise<Transaction[]> {
    return this.transactionService.getByStatus(status);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactionService.getByDateRange(startDate, endDate);
  }

  async updateTransactionStatus(transactionId: string, status: Transaction['status']): Promise<void> {
    return this.transactionService.updateStatus(transactionId, status);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    return this.transactionService.delete(transactionId);
  }

  async getPlatformStatus(platformId: string): Promise<boolean> {
    return this.statusService.getStatus(platformId);
  }

  async monitorPlatform(platformId: string): Promise<void> {
    return this.statusService.monitorPlatform(platformId);
  }

  async checkPlatformHealth(platformId: string): Promise<void> {
    return this.statusService.checkHealth(platformId);
  }
} 