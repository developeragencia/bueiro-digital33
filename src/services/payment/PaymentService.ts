import { PaymentPlatform, PaymentPlatformType, PlatformConfig, Transaction, TransactionStatus, PlatformStatusData } from '../../types/payment';
import { getPlatformService } from './platforms';
import { TransactionService } from './TransactionService';
import { WebhookService } from './WebhookService';
import { StatusService } from './StatusService';
import { PaymentPlatformService } from './PaymentPlatformService';

export class PaymentService {
  private platformService: PaymentPlatformService;
  private statusService: StatusService;
  private transactionService: TransactionService;
  private webhookService: WebhookService;

  constructor() {
    this.platformService = new PaymentPlatformService();
    this.statusService = new StatusService();
    this.transactionService = new TransactionService();
    this.webhookService = new WebhookService(this.platformService, this.transactionService);
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

  async updatePlatformConfig(platform: PaymentPlatform, config: PlatformConfig): Promise<PaymentPlatform> {
    return this.platformService.updateConfig(platform, config);
  }

  async deletePlatform(platformId: string): Promise<void> {
    return this.platformService.delete(platformId);
  }

  async processPayment(platform: PaymentPlatform, data: Record<string, any>): Promise<Transaction> {
    const transaction = await this.platformService.processPayment(platform, data);
    await this.transactionService.create(transaction);
    await this.statusService.updateMetrics(platform.id, { 
      success_rate: 1,
      created_at: new Date(),
      updated_at: new Date()
    });
    return transaction;
  }

  async processRefund(platform: PaymentPlatform, transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    const transaction = await this.platformService.processRefund(platform, transactionId, amount, reason);
    await this.transactionService.update(transaction.id, { status: transaction.status });
    return transaction;
  }

  async validateWebhook(platform: PaymentPlatform, payload: Record<string, any>, signature: string): Promise<boolean> {
    return this.platformService.validateWebhook(platform, payload, signature);
  }

  async getTransaction(platform: PaymentPlatform, transactionId: string): Promise<Transaction> {
    return this.platformService.getTransaction(platform, transactionId);
  }

  async getTransactions(platform: PaymentPlatform, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    return this.platformService.getTransactions(platform, startDate, endDate);
  }

  async getPlatformStatus(platform: PaymentPlatform): Promise<PlatformStatusData> {
    return this.platformService.getStatus(platform);
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

  async getTransactionsByStatus(status: TransactionStatus): Promise<Transaction[]> {
    return this.transactionService.getByStatus(status);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactionService.getByDateRange(startDate.toISOString(), endDate.toISOString());
  }

  async updateTransactionStatus(transactionId: string, status: TransactionStatus): Promise<Transaction> {
    return this.transactionService.updateStatus(transactionId, status);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    return this.transactionService.delete(transactionId);
  }

  async monitorPlatform(platformId: string): Promise<void> {
    return this.statusService.monitorPlatform(platformId);
  }

  async checkPlatformHealth(platformId: string): Promise<boolean> {
    return this.statusService.checkHealth(platformId);
  }

  async listTransactions(filters?: Partial<Transaction>): Promise<Transaction[]> {
    return this.transactionService.list(filters);
  }
}

export const paymentService = new PaymentService(); 