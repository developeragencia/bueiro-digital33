import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';
import crypto from 'crypto';

export class StrivPayService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.strivpay.com/api/v1';
  private readonly PRODUCTION_API_URL = 'https://api.strivpay.com/api/v1';

  constructor(config: PlatformConfig) {
    super(config);
  }

  protected getBaseUrl(): string {
    return this.config.settings?.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL;
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-StrivPay-Access-Token': this.config.settings?.apiKey || '',
      'X-StrivPay-Signature': this.generateSignature({})
    };
  }

  private mapStrivPayStatus(status: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      paid: TransactionStatus.PAID,
      pending: TransactionStatus.PENDING,
      failed: TransactionStatus.FAILED,
      refunded: TransactionStatus.REFUNDED,
      cancelled: TransactionStatus.CANCELLED,
      inactive: TransactionStatus.INACTIVE,
      error: TransactionStatus.ERROR
    };

    return statusMap[status.toLowerCase()] || TransactionStatus.UNKNOWN;
  }

  async processPayment(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction> {
    // TODO: Implementar integração com StrivPay
    throw new Error('Método não implementado');
  }

  async refundTransaction(transactionId: string, amount?: number): Promise<Transaction> {
    // TODO: Implementar integração com StrivPay
    throw new Error('Método não implementado');
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    // TODO: Implementar integração com StrivPay
    throw new Error('Método não implementado');
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    // TODO: Implementar integração com StrivPay
    throw new Error('Método não implementado');
  }

  async getStatus(): Promise<PlatformStatusData> {
    // TODO: Implementar integração com StrivPay
    throw new Error('Método não implementado');
  }

  async cancelTransaction(transactionId: string): Promise<Transaction> {
    // TODO: Implementar integração com StrivPay
    throw new Error('Método não implementado');
  }

  async validateWebhookSignature(
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    // TODO: Implementar integração com StrivPay
    throw new Error('Método não implementado');
  }

  private generateSignature(payload: Record<string, any>): string {
    const timestamp = Date.now().toString();
    const data = `${this.config.settings?.secretKey}${timestamp}`;

    return crypto
      .createHmac('sha256', this.config.settings?.secretKey || '')
      .update(data)
      .digest('hex');
  }
} 