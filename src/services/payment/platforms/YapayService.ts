import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod, WebhookPayload } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';
import crypto from 'crypto';
import { AxiosError } from 'axios';

export class YapayService extends BasePlatformService {
  protected readonly SANDBOX_API_URL = 'https://sandbox.yapay.com.br/api/v1';
  protected readonly PRODUCTION_API_URL = 'https://api.yapay.com.br/v1';

  constructor(config: PlatformConfig) {
    super(config);
  }

  public getBaseUrl(): string {
    return this.config.settings?.sandbox 
      ? this.SANDBOX_API_URL 
      : this.PRODUCTION_API_URL;
  }

  public getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Yapay-Access-Token': this.config.settings?.apiKey || '',
      'X-Yapay-Signature': this.generateSignature({})
    };
  }

  async processPayment(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/payments`,
        {
          amount,
          currency,
          payment_method: paymentMethod,
          ...paymentData
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: this.mapYapayStatus(response.data.status),
        payment_method: response.data.payment_method,
        metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at)
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refundTransaction(
    transactionId: string,
    amount?: number
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/refunds`,
        {
          transaction_id: transactionId,
          amount
        },
        { headers: this.getHeaders() }
      );

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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateWebhookSignature(
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    const calculatedSignature = this.generateSignature(payload);
    return calculatedSignature === signature;
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.get(
        `${this.getBaseUrl()}/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: this.mapYapayStatus(response.data.status),
        payment_method: response.data.payment_method,
        metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at)
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axios.get(`${this.getBaseUrl()}/transactions`, {
        headers: this.getHeaders(),
        params
      });

      return response.data.transactions.map((transaction: any) => ({
        id: transaction.id,
        platform_id: this.config.platform_id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: this.mapYapayStatus(transaction.status),
        payment_method: transaction.payment_method,
        metadata: transaction.metadata,
        created_at: new Date(transaction.created_at),
        updated_at: new Date(transaction.updated_at)
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStatus(): Promise<PlatformStatusData> {
    try {
      const response = await axios.get(`${this.getBaseUrl()}/status`, {
        headers: this.getHeaders()
      });

      return {
        is_active: response.data.is_active,
        last_checked: new Date(),
        errors: response.data.errors,
        ssl_valid: response.data.ssl_valid,
        status: this.mapYapayStatus(response.data.status),
        platform_version: response.data.platform_version,
        api_version: response.data.api_version,
        response_time: response.data.response_time,
        uptime_percentage: response.data.uptime_percentage,
        error_rate: response.data.error_rate
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/transactions/${transactionId}/cancel`,
        {},
        { headers: this.getHeaders() }
      );

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
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private mapYapayStatus(status: string): TransactionStatus {
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

    return statusMap[status.toLowerCase()] || TransactionStatus.UNKNOWN;
  }

  private generateSignature(payload: Record<string, any>): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = `${this.config.settings?.apiKey}:${timestamp}`;

    return crypto
      .createHmac('sha256', this.config.settings?.secretKey || '')
      .update(data)
      .digest('hex');
  }
} 