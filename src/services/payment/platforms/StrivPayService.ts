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
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/payments`,
        {
          amount,
          currency,
          metadata
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount,
        currency,
        status: this.mapStrivPayStatus(response.data.status),
        metadata,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at)
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refundTransaction(
    transactionId: string,
    amount?: number,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/refunds`,
        {
          transaction_id: transactionId,
          amount,
          metadata
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: TransactionStatus.REFUNDED,
        metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at)
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateWebhookSignature(
    payload: Record<string, any>,
    signature: string
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
        status: this.mapStrivPayStatus(response.data.status),
        metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at)
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTransactions(
    startDate?: Date,
    endDate?: Date,
    status?: TransactionStatus,
    limit?: number,
    offset?: number
  ): Promise<Transaction[]> {
    try {
      const response = await axios.get(`${this.getBaseUrl()}/transactions`, {
        headers: this.getHeaders(),
        params: {
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
          status,
          limit,
          offset
        }
      });

      return response.data.map((transaction: any) => ({
        id: transaction.id,
        platform_id: this.config.platform_id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: this.mapStrivPayStatus(transaction.status),
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
        status: this.mapStrivPayStatus(response.data.status),
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

  async cancelTransaction(
    transactionId: string,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/transactions/${transactionId}/cancel`,
        { metadata },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: TransactionStatus.CANCELLED,
        metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at)
      };
    } catch (error) {
      throw this.handleError(error);
    }
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