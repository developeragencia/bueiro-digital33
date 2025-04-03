import { PlatformConfig, PlatformStatusData, Transaction, TransactionStatus, PlatformStatus } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import crypto from 'crypto';

export class CartPandaService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.cartpanda.com.br/api/v1';
  private readonly PRODUCTION_API_URL = 'https://api.cartpanda.com.br/v1';

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

    try {
      const response = await fetch(`${this.getApiUrl()}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer: data.customer,
          metadata: data.metadata
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        user_id: data.user_id,
        platform_id: this.config.platformId,
        platform_type: 'cartpanda',
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          apiKey: this.config.apiKey,
          secretKey: this.config.secretKey,
          sandbox: this.config.sandbox,
          name: this.config.name
        },
        order_id: responseData.order_id,
        amount: data.amount,
        currency: data.currency,
        status: this.mapStatus(responseData.status),
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          document: data.customer.document
        },
        payment_method: responseData.payment_method,
        metadata: {
          ...data.metadata,
          cartpanda_id: responseData.id,
          payment_url: responseData.payment_url
        }
      };

      return await this.saveTransaction(transaction);
    } catch (error) {
      throw new Error(`Failed to process payment with CartPanda: ${(error as Error).message}`);
    }
  }

  async processRefund(transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    try {
      const response = await fetch(`${this.getApiUrl()}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          amount,
          reason
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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
      throw new Error(`Failed to process refund with CartPanda: ${(error as Error).message}`);
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

    try {
      const response = await fetch(`${this.getApiUrl()}/orders/${transactionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const transaction: Transaction = {
        id: transactionId,
        user_id: data.user_id,
        platform_id: this.config.platformId,
        platform_type: 'cartpanda',
        platform_settings: {
          webhookUrl: this.config.settings.webhookUrl,
          webhookSecret: this.config.settings.webhookSecret,
          apiKey: this.config.apiKey,
          secretKey: this.config.secretKey,
          sandbox: this.config.sandbox,
          name: this.config.name
        },
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency,
        status: this.mapStatus(data.status),
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          document: data.customer.document
        },
        payment_method: data.payment_method,
        metadata: data.metadata || {},
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get transaction from CartPanda: ${(error as Error).message}`);
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

  protected mapStatus(status: string): TransactionStatus {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'completed':
      case 'approved':
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

  protected calculateSignature(data: string): string {
    if (!this.secretKey) {
      throw new Error('Secret key is required');
    }
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
  }
} 