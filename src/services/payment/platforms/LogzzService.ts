import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';

export class LogzzService extends BasePlatformService {
  protected readonly SANDBOX_API_URL = 'https://sandbox.logzz.com/api/v1';
  protected readonly PRODUCTION_API_URL = 'https://api.logzz.com/api/v1';

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
        user_id: customer.id || '',
        platform_id: this.config.platform_id,
        platform_type: 'logzz' as const,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: 'Logzz'
        },
        order_id: response.data.order_id,
        amount,
        currency,
        status: this.mapStatus(response.data.status),
        customer,
        payment_method: response.data.payment_method as PaymentMethod,
        metadata,
        created_at: new Date(),
        updated_at: new Date()
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
      const transaction = await this.getTransaction(transactionId);
      
      const response = await axios.post(
        `${this.getApiUrl()}/refunds`,
        {
          transaction_id: transactionId,
          amount: amount || transaction.amount,
          reason
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        user_id: transaction.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'logzz' as const,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: 'Logzz'
        },
        order_id: transaction.order_id,
        amount: amount || transaction.amount,
        currency: transaction.currency,
        status: 'refunded',
        customer: transaction.customer,
        payment_method: transaction.payment_method,
        metadata: {
          ...transaction.metadata,
          refund_reason: reason,
          refund_date: new Date().toISOString()
        },
        created_at: new Date(),
        updated_at: new Date()
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
        user_id: response.data.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'logzz' as const,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: 'Logzz'
        },
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency as Currency,
        status: this.mapStatus(response.data.status),
        customer: response.data.customer,
        payment_method: response.data.payment_method as PaymentMethod,
        metadata: response.data.metadata,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at)
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
        user_id: tx.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'logzz' as const,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: 'Logzz'
        },
        order_id: tx.order_id,
        amount: tx.amount,
        currency: tx.currency as Currency,
        status: this.mapStatus(tx.status),
        customer: tx.customer,
        payment_method: tx.payment_method as PaymentMethod,
        metadata: tx.metadata,
        created_at: new Date(tx.created_at),
        updated_at: new Date(tx.updated_at)
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