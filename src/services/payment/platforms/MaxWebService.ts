import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';

export class MaxWebService extends BasePlatformService {
  getSandboxApiUrl(): string {
    return 'https://sandbox.maxweb.com/api/v1';
  }

  getProductionApiUrl(): string {
    return 'https://api.maxweb.com/api/v1';
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.settings.apiKey,
      'X-Secret-Key': this.config.settings.secretKey || ''
    };
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
        user_id: this.config.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'maxweb',
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        customer: response.data.customer,
        payment_method: response.data.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: this.config.settings.name
        },
        status: response.data.status as TransactionStatus,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        metadata: response.data.metadata
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async processRefund(
    transactionId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/refunds`,
        {
          transaction_id: transactionId,
          amount,
          metadata
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        user_id: this.config.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'maxweb',
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        customer: response.data.customer,
        payment_method: response.data.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: this.config.settings.name
        },
        status: response.data.status as TransactionStatus,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        metadata: response.data.metadata
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateWebhook(payload: Record<string, any>, signature: string): Promise<boolean> {
    const calculatedSignature = this.calculateSignature(payload);
    return calculatedSignature === signature;
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.get(
        `${this.getApiUrl()}/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        user_id: this.config.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'maxweb',
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        customer: response.data.customer,
        payment_method: response.data.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: this.config.settings.name
        },
        status: response.data.status as TransactionStatus,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        metadata: response.data.metadata
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

      const response = await axios.get(`${this.getApiUrl()}/transactions`, {
        headers: this.getHeaders(),
        params
      });

      return response.data.map((tx: any) => ({
        id: tx.id,
        user_id: this.config.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'maxweb',
        order_id: tx.order_id,
        amount: tx.amount,
        currency: tx.currency,
        customer: tx.customer,
        payment_method: tx.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          currency: this.config.settings.currency,
          apiKey: this.config.settings.apiKey,
          secretKey: this.config.settings.secretKey,
          sandbox: this.config.settings.sandbox,
          name: this.config.settings.name
        },
        status: tx.status as TransactionStatus,
        created_at: new Date(tx.created_at),
        updated_at: new Date(tx.updated_at),
        metadata: tx.metadata
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStatus(): Promise<PlatformStatusData> {
    try {
      const response = await axios.get(`${this.getApiUrl()}/status`, {
        headers: this.getHeaders()
      });

      return {
        platform_id: this.config.platform_id,
        status: response.data.status as TransactionStatus,
        error_rate: response.data.error_rate,
        success_rate: response.data.success_rate,
        is_active: response.data.is_active,
        last_checked: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
        metadata: response.data.metadata
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateConfig(config: Partial<PlatformConfig>): Promise<void> {
    Object.assign(this.config, config);
  }

  private calculateSignature(payload: Record<string, any>): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = `${this.config.settings.secretKey}${timestamp}`;
    return require('crypto')
      .createHmac('sha256', this.config.settings.secretKey || '')
      .update(data)
      .digest('hex');
  }
} 