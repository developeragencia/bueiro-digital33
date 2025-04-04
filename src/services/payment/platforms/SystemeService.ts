import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod, WebhookPayload } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import { logger } from '../../../utils/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo
const STATUS_CACHE_TTL = 300000; // 5 minutos

export class SystemeService extends BasePlatformService {
  protected readonly SANDBOX_API_URL = 'https://sandbox.systeme.io/api/v1';
  protected readonly PRODUCTION_API_URL = 'https://api.systeme.io/v1';
  private statusCache: { data: PlatformStatusData | null; timestamp: number } = { data: null, timestamp: 0 };

  constructor(config: PlatformConfig) {
    super(config);
    this.validateConfig(config);
  }

  private validateConfig(config: PlatformConfig): void {
    if (!config.settings?.apiKey) {
      throw new Error('API key is required for Systeme service');
    }
    if (!config.settings?.secretKey) {
      throw new Error('Secret key is required for Systeme service');
    }
  }

  public getBaseUrl(): string {
    return this.config.settings?.sandbox 
      ? this.SANDBOX_API_URL 
      : this.PRODUCTION_API_URL;
  }

  public getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.settings?.apiKey || '',
      'X-Secret-Key': this.config.settings?.secretKey || ''
    };
  }

  private mapSystemeStatus(status: string): TransactionStatus {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'paid':
        return TransactionStatus.COMPLETED;
      case 'pending':
      case 'waiting_payment':
      case 'processing':
        return TransactionStatus.PENDING;
      case 'failed':
      case 'declined':
        return TransactionStatus.FAILED;
      case 'refunded':
        return TransactionStatus.REFUNDED;
      case 'cancelled':
        return TransactionStatus.CANCELLED;
      case 'inactive':
        return TransactionStatus.INACTIVE;
      case 'error':
        return TransactionStatus.ERROR;
      default:
        logger.warn(`Unknown status received from Systeme: ${status}`);
        return TransactionStatus.UNKNOWN;
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        logger.warn(`Retrying request, attempts left: ${retries}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      return (
        error.code === 'ECONNABORTED' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        (statusCode !== undefined && statusCode >= 500)
      );
    }
    return false;
  }

  async processPayment(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction> {
    // TODO: Implementar integração com Systeme
    throw new Error('Método não implementado');
  }

  async refundTransaction(
    transactionId: string,
    amount?: number
  ): Promise<Transaction> {
    // TODO: Implementar integração com Systeme
    throw new Error('Método não implementado');
  }

  async cancelTransaction(transactionId: string): Promise<Transaction> {
    // TODO: Implementar integração com Systeme
    throw new Error('Método não implementado');
  }

  async validateWebhookSignature(
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    // TODO: Implementar integração com Systeme
    throw new Error('Método não implementado');
  }

  private validatePaymentData(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): void {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    if (!currency) {
      throw new Error('Currency is required');
    }
    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }
    if (!paymentData) {
      throw new Error('Payment data is required');
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    // TODO: Implementar integração com Systeme
    throw new Error('Método não implementado');
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    // TODO: Implementar integração com Systeme
    throw new Error('Método não implementado');
  }

  async getStatus(): Promise<PlatformStatusData> {
    // TODO: Implementar integração com Systeme
    throw new Error('Método não implementado');
  }

  private generateSignature(payload: Record<string, any>): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = `${this.config.settings?.secretKey}${timestamp}`