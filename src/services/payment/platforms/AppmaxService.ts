import { PlatformConfig, PlatformStatusData, Transaction, TransactionStatus, PlatformStatus } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';
import crypto from 'crypto';

export class AppmaxService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.appmax.com.br/api/v1';
  private readonly PRODUCTION_API_URL = 'https://appmax.com.br/api/v1';

  constructor(config: PlatformConfig) {
    super(config);
  }

  protected getSandboxApiUrl(): string {
    return this.SANDBOX_API_URL;
  }

  protected getProductionApiUrl(): string {
    return this.PRODUCTION_API_URL;
  }

  async processPayment(data: Record<string, any>): Promise<Transaction> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    const url = `${this.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL}/sales`;

    try {
      const response = await axios.post(url, {
        amount: data.amount,
        currency: data.currency,
        customer: data.customer,
        metadata: data.metadata
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        user_id: data.user_id,
        platform_id: this.config.platformId,
        platform_type: 'appmax',
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          apiKey: this.config.apiKey,
          secretKey: this.config.secretKey,
          sandbox: this.config.sandbox,
          name: this.config.name
        },
        order_id: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: this.mapStatus(response.data.status),
        customer: {
          name: response.data.customer.name,
          email: response.data.customer.email,
          phone: response.data.customer.phone,
          document: response.data.customer.document
        },
        payment_method: response.data.payment_method,
        metadata: data.metadata || {}
      };

      return await this.saveTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to process payment with Appmax: ${(error as Error).message}`);
    }
  }

  async processRefund(transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    const url = `${this.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL}/sales/${transactionId}/refund`;

    try {
      const response = await axios.post(url, {
        amount,
        reason
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction = await this.getTransaction(transactionId);
      
      const refundedTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        user_id: transaction.user_id,
        platform_id: transaction.platform_id,
        platform_type: transaction.platform_type,
        platform_settings: transaction.platform_settings,
        order_id: transaction.order_id,
        amount: amount || transaction.amount,
        currency: transaction.currency,
        status: this.mapStatus('refunded'),
        customer: transaction.customer,
        payment_method: transaction.payment_method,
        metadata: {
          ...transaction.metadata,
          refund_amount: amount || transaction.amount,
          refund_reason: reason || 'customer_request',
          refund_date: new Date().toISOString()
        }
      };

      return await this.saveTransaction(refundedTransaction);
    } catch (error) {
      throw new Error(`Failed to process refund with Appmax: ${(error as Error).message}`);
    }
  }

  async validateWebhook(payload: Record<string, any>, signature: string): Promise<boolean> {
    const calculatedSignature = this.calculateSignature(JSON.stringify(payload));
    return calculatedSignature === signature;
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    const url = `${this.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL}/orders/${transactionId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction: Transaction = {
        id: transactionId,
        user_id: 'user123',
        platform_id: this.config.platformId,
        platform_type: 'appmax',
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          apiKey: this.config.apiKey,
          secretKey: this.config.secretKey,
          sandbox: this.config.sandbox,
          name: this.config.name
        },
        order_id: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: this.mapStatus(response.data.status),
        customer: {
          name: response.data.customer.name,
          email: response.data.customer.email,
          phone: response.data.customer.phone,
          document: response.data.customer.document
        },
        payment_method: response.data.payment_method,
        metadata: {},
        created_at: new Date(),
        updated_at: new Date()
      };

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get transaction from Appmax: ${(error as Error).message}`);
    }
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      // Implementar busca real de transações aqui
      return [];
    } catch (error) {
      throw new Error(`Failed to get transactions: ${(error as Error).message}`);
    }
  }

  async getStatus(): Promise<PlatformStatusData> {
    return {
      platform_id: this.config.platformId,
      is_active: true,
      uptime: 99.9,
      error_rate: 0.01,
      last_check: new Date(),
      status: 'active' as PlatformStatus
    };
  }

  async updateConfig(config: Partial<PlatformConfig>): Promise<void> {
    this.config = {
      ...this.config,
      ...config
    };
  }

  protected calculateSignature(data: string): string {
    if (!this.secretKey) {
      throw new Error('Secret key is required');
    }
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
  }

  protected mapStatus(status: string): TransactionStatus {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'approved':
      case 'completed':
        return 'completed';
      case 'failed':
      case 'declined':
        return 'failed';
      case 'refunded':
        return 'refunded';
      case 'disputed':
        return 'disputed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
} 