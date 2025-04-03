import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';

export class TictoService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.api.ticto.com.br/v1';
  private readonly PRODUCTION_API_URL = 'https://api.ticto.com.br/v1';

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
    return {
      ...super.getHeaders(),
      'X-Ticto-Key': this.apiKey,
      'X-Ticto-Signature': this.generateSignature()
    };
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
        platform_id: this.platformId,
        platform_type: 'ticto',
        platform_settings: this.config.settings,
        order_id: response.data.order_id,
        amount,
        currency,
        status: this.mapStatus(response.data.status),
        customer,
        payment_method: response.data.payment_method as PaymentMethod,
        metadata: metadata || {},
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error: any) {
      throw this.createError(
        error.message || 'Failed to process payment',
        'PAYMENT_PROCESSING_ERROR',
        error.response?.status
      );
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
        ...transaction,
        status: amount === transaction.amount ? 'refunded' : 'partially_refunded',
        refunded_amount: amount || transaction.amount,
        metadata: {
          ...transaction.metadata,
          refund_reason: reason,
          refund_date: new Date().toISOString()
        },
        updated_at: new Date()
      };
    } catch (error: any) {
      throw this.createError(
        error.message || 'Failed to process refund',
        'REFUND_PROCESSING_ERROR',
        error.response?.status
      );
    }
  }

  async validateWebhook(
    payload: Record<string, any>,
    signature: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.getApiUrl()}/webhooks/validate`,
        { payload, signature },
        { headers: this.getHeaders() }
      );
      return response.data.valid;
    } catch (error: any) {
      throw this.createError(
        error.message || 'Failed to validate webhook',
        'WEBHOOK_VALIDATION_ERROR',
        error.response?.status
      );
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
        platform_id: this.platformId,
        platform_type: 'ticto',
        platform_settings: this.config.settings,
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency as Currency,
        status: this.mapStatus(response.data.status),
        customer: response.data.customer,
        payment_method: response.data.payment_method as PaymentMethod,
        metadata: response.data.metadata || {},
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at)
      };
    } catch (error: any) {
      throw this.createError(
        error.message || 'Failed to get transaction',
        'TRANSACTION_FETCH_ERROR',
        error.response?.status
      );
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

      return response.data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        platform_id: this.platformId,
        platform_type: 'ticto',
        platform_settings: this.config.settings,
        order_id: item.order_id,
        amount: item.amount,
        currency: item.currency as Currency,
        status: this.mapStatus(item.status),
        customer: item.customer,
        payment_method: item.payment_method as PaymentMethod,
        metadata: item.metadata || {},
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at)
      }));
    } catch (error: any) {
      throw this.createError(
        error.message || 'Failed to get transactions',
        'TRANSACTIONS_FETCH_ERROR',
        error.response?.status
      );
    }
  }

  async getStatus(): Promise<PlatformStatusData> {
    try {
      const response = await axios.get(`${this.getApiUrl()}/status`, {
        headers: this.getHeaders()
      });

      return {
        platform_id: this.platformId,
        is_active: response.data.is_active,
        uptime: response.data.uptime,
        error_rate: response.data.error_rate,
        last_check: new Date(),
        status: response.data.is_active ? 'active' : 'inactive',
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error: any) {
      return {
        platform_id: this.platformId,
        is_active: false,
        uptime: 0,
        error_rate: 1,
        last_check: new Date(),
        status: 'error',
        message: error.message || 'Failed to get platform status',
        created_at: new Date(),
        updated_at: new Date()
      };
    }
  }

  async updateConfig(config: Partial<PlatformConfig>): Promise<void> {
    try {
      await axios.put(
        `${this.getApiUrl()}/config`,
        config,
        { headers: this.getHeaders() }
      );
      Object.assign(this.config, config);
    } catch (error: any) {
      throw this.createError(
        error.message || 'Failed to update config',
        'CONFIG_UPDATE_ERROR',
        error.response?.status
      );
    }
  }

  private calculateSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = `${this.apiKey}${timestamp}`;
    return require('crypto')
      .createHmac('sha256', this.secretKey!)
      .update(data)
      .digest('hex');
  }

  private mapStatus(status: string): Transaction['status'] {
    const statusMap: Record<string, Transaction['status']> = {
      'approved': 'completed',
      'pending': 'pending',
      'processing': 'processing',
      'failed': 'failed',
      'refunded': 'refunded',
      'partially_refunded': 'refunded',
      'cancelled': 'cancelled',
      'expired': 'failed',
      'chargeback': 'failed',
      'dispute': 'processing',
      'waiting_payment': 'pending',
      'analysis': 'processing',
      'fraud_analysis': 'processing',
      'high_risk': 'failed',
      'blocked': 'failed'
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }
} 