import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';

export class ShopifyService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.shopify.com/api/v1';
  private readonly PRODUCTION_API_URL = 'https://api.shopify.com/api/v1';

  constructor(platformId: string, apiKey: string, secretKey?: string, sandbox: boolean = true) {
    super(platformId, apiKey, secretKey, sandbox);
  }

  protected getSandboxApiUrl(): string {
    return this.SANDBOX_API_URL;
  }

  protected getProductionApiUrl(): string {
    return this.PRODUCTION_API_URL;
  }

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.settings.apiKey || ''
    };
    return headers;
  }

  protected mapStatus(status: string): TransactionStatus {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'paid':
        return 'paid';
      case 'pending':
        return 'pending';
      case 'failed':
      case 'declined':
        return 'failed';
      case 'refunded':
        return 'refunded';
      case 'cancelled':
        return 'cancelled';
      case 'inactive':
        return 'inactive';
      default:
        return 'error';
    }
  }

  async processPayment(
    amount: number,
    currency: Currency,
    customer: Customer,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/payments`,
        {
          amount,
          currency,
          customer,
          metadata
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount,
        currency,
        customer,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: 'Shopify'
        },
        status: this.mapStatus(response.data.status),
        created_at: new Date(),
        updated_at: new Date(),
        metadata
      };
    } catch (error) {
      throw this.createError('Failed to process payment', error);
    }
  }

  async processRefund(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/refunds`,
        {
          transaction_id: transactionId,
          amount,
          reason
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency as Currency,
        customer: response.data.customer,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: 'Shopify'
        },
        status: this.mapStatus(response.data.status),
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        metadata: response.data.metadata
      };
    } catch (error) {
      throw this.createError('Failed to process refund', error);
    }
  }

  async validateWebhook(payload: Record<string, any>, signature: string): Promise<boolean> {
    try {
      const calculatedSignature = this.calculateSignature(payload);
      return calculatedSignature === signature;
    } catch (error) {
      throw this.createError('Failed to validate webhook', error);
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        amount: response.data.amount,
        currency: response.data.currency as Currency,
        customer: response.data.customer,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: 'Shopify'
        },
        status: this.mapStatus(response.data.status),
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        metadata: response.data.metadata
      };
    } catch (error) {
      throw this.createError('Failed to get transaction', error);
    }
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.start_date = startDate.toISOString();
      if (endDate) params.end_date = endDate.toISOString();

      const response = await axios.get(`${this.getApiUrl()}/transactions`, {
        headers: this.getHeaders(),
        params
      });

      return response.data.transactions.map((tx: any) => ({
        id: tx.id,
        platform_id: this.config.platform_id,
        amount: tx.amount,
        currency: tx.currency as Currency,
        customer: tx.customer,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: 'Shopify'
        },
        status: this.mapStatus(tx.status),
        created_at: new Date(tx.created_at),
        updated_at: new Date(tx.updated_at),
        metadata: tx.metadata
      }));
    } catch (error) {
      throw this.createError('Failed to get transactions', error);
    }
  }

  async getStatus(): Promise<PlatformStatusData> {
    try {
      const response = await axios.get(`${this.getApiUrl()}/status`, {
        headers: this.getHeaders()
      });

      return {
        platform_id: this.config.platform_id,
        status: response.data.is_active ? 'active' as TransactionStatus : 'inactive' as TransactionStatus,
        success_rate: response.data.success_rate,
        error_rate: response.data.error_rate,
        latency: response.data.latency,
        uptime: response.data.uptime,
        last_checked: new Date()
      };
    } catch (error) {
      throw this.createError('Failed to get platform status', error);
    }
  }

  async updateConfig(config: Partial<PlatformConfig>): Promise<void> {
    try {
      await axios.put(
        `${this.getApiUrl()}/config`,
        config,
        { headers: this.getHeaders() }
      );
    } catch (error) {
      throw this.createError('Failed to update platform configuration', error);
    }
  }

  private calculateSignature(payload: Record<string, any>): string {
    const data = JSON.stringify(payload);
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.config.settings.webhookSecret || '')
      .update(data)
      .digest('hex');
  }
} 