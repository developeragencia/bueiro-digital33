import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import { logger } from '../../../utils/logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo
const STATUS_CACHE_TTL = 300000; // 5 minutos

export class HublaService extends BasePlatformService {
  protected readonly SANDBOX_API_URL = 'https://api.sandbox.hubla.com/v1';
  protected readonly PRODUCTION_API_URL = 'https://api.hubla.com/v1';
  private statusCache: { data: PlatformStatusData | null; timestamp: number } = { data: null, timestamp: 0 };

  constructor(config: PlatformConfig) {
    super(config);
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.settings?.apiKey) {
      throw new Error('API Key é obrigatória para o HublaService');
    }
    if (!this.config.settings?.secretKey) {
      throw new Error('Secret Key é obrigatória para o HublaService');
    }
  }

  public getBaseUrl(): string {
    return this.config.settings?.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL;
  }

  public getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.settings?.apiKey || ''}`,
      'X-Hubla-Version': '2023-01-01'
    };
  }

  protected mapStatus(status: string): TransactionStatus {
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
        logger.warn(`Unknown status received from Hubla: ${status}`);
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

  public async processPayment(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction> {
    this.validatePaymentData(amount, currency, paymentMethod, paymentData);

    const requestPayload = {
      amount,
      currency,
      customer: {
        name: paymentData.customer?.name || '',
        email: paymentData.customer?.email || '',
        document: paymentData.customer?.document || '',
        phone: paymentData.customer?.phone || ''
      },
      payment_method: paymentMethod,
      installments: paymentData.installments || 1,
      ...paymentData
    };

    try {
      return await this.retryRequest(async () => {
        const response = await axios.post(
          `${this.getBaseUrl()}/payments`,
          requestPayload,
          { headers: this.getHeaders() }
        );

        logger.info(`Payment processed successfully: ${response.data.id}`);

        const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
          user_id: paymentData.user_id,
          platform_id: this.config.platform_id,
          platform_type: 'hubla',
          platform_settings: this.config.settings,
          order_id: response.data.id,
          amount,
          currency,
          status: this.mapStatus(response.data.status),
          customer: paymentData.customer,
          payment_method: paymentMethod,
          metadata: {
            ...paymentData,
            hubla_id: response.data.id,
            payment_url: response.data.payment_url,
            invoice_url: response.data.invoice_url
          }
        };

        return await this.saveTransaction(transaction);
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Payment processing failed: ${errorMessage}`);
      throw this.handleError(error);
    }
  }

  public async refundTransaction(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction> {
    try {
      return await this.retryRequest(async () => {
        const transaction = await this.getTransaction(transactionId);

        const response = await axios.post(
          `${this.getBaseUrl()}/refunds`,
          {
            payment_id: transactionId,
            amount: amount || transaction.amount,
            reason: reason || 'customer_request'
          },
          { headers: this.getHeaders() }
        );

        logger.info(`Refund processed successfully: ${response.data.id}`);

        const refundedTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
          user_id: transaction.user_id,
          platform_id: transaction.platform_id,
          platform_type: transaction.platform_type,
          platform_settings: transaction.platform_settings,
          order_id: transaction.order_id,
          amount: amount || transaction.amount,
          currency: transaction.currency,
          status: TransactionStatus.REFUNDED,
          customer: transaction.customer,
          payment_method: transaction.payment_method,
          metadata: {
            ...transaction.metadata,
            refund_id: response.data.id,
            refund_amount: amount || transaction.amount,
            refund_reason: reason || 'customer_request',
            refund_date: new Date().toISOString()
          }
        };

        return await this.saveTransaction(refundedTransaction);
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Refund processing failed: ${errorMessage}`);
      throw this.handleError(error);
    }
  }

  public async cancelTransaction(transactionId: string): Promise<Transaction> {
    try {
      return await this.retryRequest(async () => {
        const transaction = await this.getTransaction(transactionId);

        const response = await axios.post(
          `${this.getBaseUrl()}/payments/${transactionId}/cancel`,
          {},
          { headers: this.getHeaders() }
        );

        logger.info(`Transaction cancelled successfully: ${response.data.id}`);

        const cancelledTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
          user_id: transaction.user_id,
          platform_id: transaction.platform_id,
          platform_type: transaction.platform_type,
          platform_settings: transaction.platform_settings,
          order_id: transaction.order_id,
          amount: transaction.amount,
          currency: transaction.currency,
          status: TransactionStatus.CANCELLED,
          customer: transaction.customer,
          payment_method: transaction.payment_method,
          metadata: {
            ...transaction.metadata,
            cancelled_at: new Date().toISOString()
          }
        };

        return await this.saveTransaction(cancelledTransaction);
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Transaction cancellation failed: ${errorMessage}`);
      throw this.handleError(error);
    }
  }

  public async validateWebhookSignature(
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    const calculatedSignature = this.calculateSignature(payload);
    return calculatedSignature === signature;
  }

  private validatePaymentData(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): void {
    if (!amount || amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!currency) {
      throw new Error('Currency is required');
    }
    if (!paymentMethod) {
      throw new Error('Payment method is required');
    }
    if (!paymentData.customer?.email) {
      throw new Error('Customer email is required');
    }
    if (!paymentData.customer?.document) {
      throw new Error('Customer document is required');
    }
  }

  public async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      return await this.retryRequest(async () => {
        const response = await axios.get(
          `${this.getBaseUrl()}/payments/${transactionId}`,
          { headers: this.getHeaders() }
        );

        return {
          id: transactionId,
          user_id: response.data.user_id,
          platform_id: this.config.platform_id,
          platform_type: 'hubla',
          platform_settings: this.config.settings,
          order_id: response.data.id,
          amount: response.data.amount,
          currency: response.data.currency,
          status: this.mapStatus(response.data.status),
          customer: {
            name: response.data.customer.name,
            email: response.data.customer.email,
            document: response.data.customer.document,
            phone: response.data.customer.phone
          },
          payment_method: response.data.payment_method,
          metadata: {
            hubla_id: response.data.id,
            payment_url: response.data.payment_url,
            invoice_url: response.data.invoice_url
          },
          created_at: new Date(response.data.created_at),
          updated_at: new Date(response.data.updated_at)
        };
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Failed to get transaction: ${errorMessage}`);
      throw this.handleError(error);
    }
  }

  public async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      return await this.retryRequest(async () => {
        const params: Record<string, any> = {};
        if (startDate) params.start_date = startDate.toISOString();
        if (endDate) params.end_date = endDate.toISOString();

        const response = await axios.get(`${this.getBaseUrl()}/payments`, {
          headers: this.getHeaders(),
          params
        });

        return response.data.payments.map((payment: any) => ({
          id: payment.id,
          user_id: payment.user_id,
          platform_id: this.config.platform_id,
          platform_type: 'hubla',
          platform_settings: this.config.settings,
          order_id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: this.mapStatus(payment.status),
          customer: {
            name: payment.customer.name,
            email: payment.customer.email,
            document: payment.customer.document,
            phone: payment.customer.phone
          },
          payment_method: payment.payment_method,
          metadata: {
            hubla_id: payment.id,
            payment_url: payment.payment_url,
            invoice_url: payment.invoice_url
          },
          created_at: new Date(payment.created_at),
          updated_at: new Date(payment.updated_at)
        }));
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Failed to get transactions: ${errorMessage}`);
      throw this.handleError(error);
    }
  }

  public async getStatus(): Promise<PlatformStatusData> {
    const now = Date.now();
    if (this.statusCache.data && now - this.statusCache.timestamp < STATUS_CACHE_TTL) {
      return this.statusCache.data;
    }

    try {
      return await this.retryRequest(async () => {
        const response = await axios.get(`${this.getBaseUrl()}/status`, {
          headers: this.getHeaders()
        });

        const statusData: PlatformStatusData = {
          is_active: response.data.is_active,
          error_rate: response.data.error_rate,
          status: this.mapStatus(response.data.status),
          last_checked: new Date()
        };

        this.statusCache = {
          data: statusData,
          timestamp: now
        };

        return statusData;
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Failed to get status: ${errorMessage}`);
      throw this.handleError(error);
    }
  }

  private calculateSignature(payload: Record<string, any>): string {
    const hmac = crypto.createHmac('sha256', this.config.settings?.secretKey || '');
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }
} 