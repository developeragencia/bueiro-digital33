import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import { logger } from '../../../utils/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo
const STATUS_CACHE_TTL = 300000; // 5 minutos

export class MundPayService extends BasePlatformService {
  protected readonly SANDBOX_API_URL = 'https://sandbox.mundpay.com/api/v1';
  protected readonly PRODUCTION_API_URL = 'https://api.mundpay.com/v1';
  private statusCache: { data: PlatformStatusData | null; timestamp: number } = { data: null, timestamp: 0 };

  constructor(config: PlatformConfig) {
    super(config);
    this.validateConfig(config);
  }

  private validateConfig(config: PlatformConfig): void {
    if (!config.settings?.apiKey) {
      throw new Error('API key is required for MundPay service');
    }
    if (!config.settings?.secretKey) {
      throw new Error('Secret key is required for MundPay service');
    }
  }

  public getBaseUrl(): string {
    return this.config.settings?.sandbox 
      ? this.SANDBOX_API_URL 
      : this.PRODUCTION_API_URL;
  }

  public getHeaders(payload?: Record<string, any>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-MundPay-Access-Token': this.config.settings?.apiKey || '',
      'X-MundPay-Signature': this.generateSignature(payload)
    };
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
    this.validatePaymentData(amount, currency, paymentMethod, paymentData);

    const requestPayload = {
      amount,
      currency,
      payment_method: paymentMethod,
      ...paymentData
    };

    return this.retryRequest(async () => {
    try {
      const response = await axios.post(
          `${this.getBaseUrl()}/payments`,
          requestPayload,
          { headers: this.getHeaders(requestPayload) }
        );

        logger.info(`Payment processed successfully: ${response.data.id}`);

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency,
          status: this.mapMundPayStatus(response.data.status),
        payment_method: response.data.payment_method,
          metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
          updated_at: new Date(response.data.updated_at)
      };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`Payment processing failed: ${errorMessage}`);
      throw this.handleError(error);
    }
    });
  }

  async refundTransaction(
    transactionId: string,
    amount?: number
  ): Promise<Transaction> {
    return this.retryRequest(async () => {
    try {
        const requestPayload = {
          transaction_id: transactionId,
          amount
        };

        const response = await axios.post(
          `${this.getBaseUrl()}/refunds`,
          requestPayload,
          { headers: this.getHeaders(requestPayload) }
        );

        logger.info(`Refund processed successfully: ${response.data.id}`);

        return {
          id: response.data.id,
          platform_id: this.config.platform_id,
          amount: response.data.amount,
          currency: response.data.currency,
          status: TransactionStatus.REFUNDED,
          payment_method: response.data.payment_method,
          metadata: response.data.metadata,
          created_at: new Date(response.data.created_at),
          updated_at: new Date(response.data.updated_at)
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`Refund processing failed: ${errorMessage}`);
        throw this.handleError(error);
      }
    });
  }

  async cancelTransaction(transactionId: string): Promise<Transaction> {
    return this.retryRequest(async () => {
      try {
        const response = await axios.post(
          `${this.getBaseUrl()}/transactions/${transactionId}/cancel`,
          {},
        { headers: this.getHeaders() }
      );

        logger.info(`Transaction cancelled successfully: ${response.data.id}`);

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency,
          status: TransactionStatus.CANCELLED,
        payment_method: response.data.payment_method,
          metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
          updated_at: new Date(response.data.updated_at)
      };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`Transaction cancellation failed: ${errorMessage}`);
      throw this.handleError(error);
      }
    });
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

  async getStatus(): Promise<PlatformStatusData> {
    const now = Date.now();
    if (this.statusCache.data && now - this.statusCache.timestamp < STATUS_CACHE_TTL) {
      return this.statusCache.data;
    }

    return this.retryRequest(async () => {
      try {
        const response = await axios.get(`${this.getBaseUrl()}/status`, {
          headers: this.getHeaders()
        });

        const statusData: PlatformStatusData = {
          is_active: response.data.is_active,
          last_checked: new Date(),
          errors: response.data.errors,
          ssl_valid: response.data.ssl_valid,
          status: this.mapMundPayStatus(response.data.status),
          platform_version: response.data.platform_version,
          api_version: response.data.api_version,
          response_time: response.data.response_time,
          uptime_percentage: response.data.uptime_percentage,
          error_rate: response.data.error_rate
        };

        this.statusCache = {
          data: statusData,
          timestamp: now
        };

        return statusData;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`Failed to get platform status: ${errorMessage}`);
        throw this.handleError(error);
      }
    });
  }

  private mapMundPayStatus(status: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'pending': TransactionStatus.PENDING,
      'processing': TransactionStatus.PROCESSING,
      'authorized': TransactionStatus.AUTHORIZED,
      'paid': TransactionStatus.PAID,
      'completed': TransactionStatus.COMPLETED,
      'failed': TransactionStatus.FAILED,
      'refunded': TransactionStatus.REFUNDED,
      'cancelled': TransactionStatus.CANCELLED,
      'error': TransactionStatus.ERROR,
      'inactive': TransactionStatus.INACTIVE
    };

    const mappedStatus = statusMap[status.toLowerCase()];
    if (!mappedStatus) {
      logger.warn(`Unknown status received from MundPay: ${status}`);
      return TransactionStatus.UNKNOWN;
    }

    return mappedStatus;
  }

  private generateSignature(payload?: Record<string, any>): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = payload 
      ? `${this.config.settings?.apiKey}:${timestamp}:${JSON.stringify(payload)}`
      : `${this.config.settings?.apiKey}:${timestamp}`;

    return crypto
      .createHmac('sha256', this.config.settings?.secretKey || '')
      .update(data)
      .digest('hex');
  }

  async validateWebhookSignature(
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    const calculatedSignature = this.generateSignature(payload);
    return calculatedSignature === signature;
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    return this.retryRequest(async () => {
    try {
      const response = await axios.get(
          `${this.getBaseUrl()}/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

        logger.info(`Transaction details retrieved successfully: ${response.data.id}`);

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency,
          status: this.mapMundPayStatus(response.data.status),
        payment_method: response.data.payment_method,
          metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
          updated_at: new Date(response.data.updated_at)
      };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`Failed to retrieve transaction details: ${errorMessage}`);
      throw this.handleError(error);
    }
    });
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    return this.retryRequest(async () => {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

        const response = await axios.get(`${this.getBaseUrl()}/transactions`, {
        headers: this.getHeaders(),
        params
      });

        logger.info(`Retrieved ${response.data.transactions.length} transactions`);

        return response.data.transactions.map((transaction: any) => ({
          id: transaction.id,
        platform_id: this.config.platform_id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: this.mapMundPayStatus(transaction.status),
          payment_method: transaction.payment_method,
          metadata: transaction.metadata,
          created_at: new Date(transaction.created_at),
          updated_at: new Date(transaction.updated_at)
        }));
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        logger.error(`Failed to retrieve transactions list: ${errorMessage}`);
      throw this.handleError(error);
    }
    });
  }
} 