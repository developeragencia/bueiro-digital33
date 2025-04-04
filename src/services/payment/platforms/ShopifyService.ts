import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';
import crypto from 'crypto';

export class ShopifyService extends BasePlatformService {
  protected readonly SANDBOX_API_URL = 'https://sandbox.shopify.com/admin/api/2024-01';
  protected readonly PRODUCTION_API_URL = 'https://shopify.com/admin/api/2024-01';

  constructor(config: PlatformConfig) {
    super(config);
  }

  public getBaseUrl(): string {
    return this.config.settings?.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL;
  }

  public getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.config.settings?.apiKey || '',
      'X-Shopify-Shop-Domain': this.config.settings?.name || ''
    };
  }

  private mapShopifyStatus(status: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      paid: TransactionStatus.COMPLETED,
      pending: TransactionStatus.PENDING,
      failed: TransactionStatus.FAILED,
      refunded: TransactionStatus.REFUNDED,
      cancelled: TransactionStatus.CANCELLED,
      inactive: TransactionStatus.INACTIVE,
      error: TransactionStatus.ERROR
    };

    return statusMap[status.toLowerCase()] || TransactionStatus.UNKNOWN;
  }

  public async processPayment(
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
        amount,
        currency,
        status: this.mapShopifyStatus(response.data.status),
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        platform_id: this.config.platform_id,
        metadata: response.data.metadata,
        payment_method: paymentMethod
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async refundTransaction(transactionId: string, amount?: number): Promise<Transaction> {
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
        amount: response.data.amount,
        currency: response.data.currency,
        status: this.mapShopifyStatus(response.data.status),
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        platform_id: this.config.platform_id,
        metadata: response.data.metadata,
        payment_method: response.data.payment_method
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.get(
        `${this.getBaseUrl()}/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: this.mapShopifyStatus(response.data.status),
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        platform_id: this.config.platform_id,
        metadata: response.data.metadata,
        payment_method: response.data.payment_method
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
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
        amount: transaction.amount,
        currency: transaction.currency,
        status: this.mapShopifyStatus(transaction.status),
        created_at: new Date(transaction.created_at),
        updated_at: new Date(transaction.updated_at),
        platform_id: this.config.platform_id,
        metadata: transaction.metadata,
        payment_method: transaction.payment_method
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async getStatus(): Promise<PlatformStatusData> {
    try {
      const response = await axios.get(`${this.getBaseUrl()}/status`, {
        headers: this.getHeaders()
      });

      return {
        is_active: response.data.is_active,
        last_checked: new Date(),
        errors: response.data.errors,
        ssl_valid: response.data.ssl_valid,
        status: this.mapShopifyStatus(response.data.status),
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

  public async cancelTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/transactions/${transactionId}/cancel`,
        {},
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: this.mapShopifyStatus(response.data.status),
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        platform_id: this.config.platform_id,
        metadata: response.data.metadata,
        payment_method: response.data.payment_method
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async validateWebhookSignature(signature: string, payload: Record<string, any>): Promise<boolean> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = `${this.config.settings?.secretKey}${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.config.settings?.secretKey || '')
      .update(data)
      .digest('hex');

    return signature === expectedSignature;
  }
} 