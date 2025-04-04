import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import { logger } from '../../../utils/logger';
import crypto from 'crypto';

const STATUS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class ShopifyService extends BasePlatformService {
  protected readonly SANDBOX_API_URL = 'https://sandbox.shopify.com/admin/api/2024-01';
  protected readonly PRODUCTION_API_URL = 'https://shopify.com/admin/api/2024-01';

  private statusCache: {
    data: PlatformStatusData | null;
    timestamp: number;
  } = {
    data: null,
    timestamp: 0
  };

  constructor(config: PlatformConfig) {
    super(config);
    if (!config.settings.apiKey || !config.settings.secretKey) {
      throw new Error('API key and secret key are required for Shopify service');
    }
  }

  protected getBaseUrl(): string {
    return this.config.settings.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL;
  }

  protected getHeaders(): Record<string, string> {
    if (!this.config.settings.apiKey) {
      throw new Error('API key is required for Shopify service');
    }
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.config.settings.apiKey,
      'X-Shopify-Hmac-Sha256': this.generateSignature()
    };
  }

  protected mapStatus(status: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'pending': TransactionStatus.PENDING,
      'processing': TransactionStatus.PROCESSING,
      'completed': TransactionStatus.COMPLETED,
      'failed': TransactionStatus.FAILED,
      'refunded': TransactionStatus.REFUNDED,
      'cancelled': TransactionStatus.CANCELLED
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
      const response = await this.makeRequest<Record<string, any>>('POST', '/orders', {
        order: {
          total_price: amount,
          currency,
          payment_method: paymentMethod,
          ...paymentData
        }
      });

      return this.saveTransaction({
        user_id: paymentData.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'shopify',
        platform_settings: this.config.settings,
        order_id: response.order.id,
        amount,
        currency,
        status: this.mapStatus(response.order.financial_status),
        customer: {
          name: response.order.customer.name,
          email: response.order.customer.email,
          document: response.order.customer.tax_number,
          phone: response.order.customer.phone
        },
        payment_method: paymentMethod,
        metadata: {
          ...response.order,
          shopify_order_id: response.order.id
        }
      });
    } catch (error) {
      logger.error('Error processing payment:', error);
      throw this.createError('Failed to process payment', error);
    }
  }

  public async refundTransaction(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction> {
    try {
      const transaction = await this.getTransaction(transactionId);
      const response = await this.makeRequest<Record<string, any>>('POST', `/orders/${transaction.order_id}/refunds`, {
        refund: {
          amount,
          reason,
          notify: true
        }
      });

      return this.updateTransaction(transactionId, {
        status: TransactionStatus.REFUNDED,
        metadata: {
          ...transaction.metadata,
          refund_amount: amount,
          refund_reason: reason,
          refund_date: new Date(),
          shopify_refund_id: response.refund.id
        }
      });
    } catch (error) {
      logger.error('Error refunding transaction:', error);
      throw this.createError('Failed to refund transaction', error);
    }
  }

  public async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await this.makeRequest<Record<string, any>>('GET', `/orders/${transactionId}`);
      return {
        id: transactionId,
        user_id: response.order.customer.id,
        platform_id: this.config.platform_id,
        platform_type: 'shopify',
        platform_settings: this.config.settings,
        order_id: response.order.id,
        amount: response.order.total_price,
        currency: response.order.currency as Currency,
        status: this.mapStatus(response.order.financial_status),
        customer: {
          name: response.order.customer.name,
          email: response.order.customer.email,
          document: response.order.customer.tax_number,
          phone: response.order.customer.phone
        },
        payment_method: response.order.payment_method as PaymentMethod,
        metadata: {
          ...response.order,
          shopify_order_id: response.order.id
        },
        created_at: new Date(response.order.created_at),
        updated_at: new Date(response.order.updated_at)
      };
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw this.createError('Failed to get transaction', error);
    }
  }

  public async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      const response = await this.makeRequest<Record<string, any>[]>('GET', '/orders', undefined, {
        created_at_min: startDate?.toISOString(),
        created_at_max: endDate?.toISOString()
      });

      return response.map(order => ({
        id: order.id,
        user_id: order.customer.id,
        platform_id: this.config.platform_id,
        platform_type: 'shopify',
        platform_settings: this.config.settings,
        order_id: order.id,
        amount: order.total_price,
        currency: order.currency as Currency,
        status: this.mapStatus(order.financial_status),
        customer: {
          name: order.customer.name,
          email: order.customer.email,
          document: order.customer.tax_number,
          phone: order.customer.phone
        },
        payment_method: order.payment_method as PaymentMethod,
        metadata: {
          ...order,
          shopify_order_id: order.id
        },
        created_at: new Date(order.created_at),
        updated_at: new Date(order.updated_at)
      }));
    } catch (error) {
      logger.error('Error getting transactions:', error);
      throw this.createError('Failed to get transactions', error);
    }
  }

  public async getStatus(): Promise<PlatformStatusData> {
    const now = Date.now();
    if (this.statusCache.data && now - this.statusCache.timestamp < STATUS_CACHE_TTL) {
      return this.statusCache.data;
    }

    try {
      const response = await this.makeRequest<Record<string, any>>('GET', '/shop');
      
      const status: PlatformStatusData = {
        is_active: response.shop.status === 'active',
        error_rate: 0,
        status: this.mapStatus(response.shop.status),
        last_checked: new Date()
      };

      this.statusCache = {
        data: status,
        timestamp: now
      };

      return status;
    } catch (error) {
      logger.error('Error getting platform status:', error);
      throw this.createError('Failed to get platform status', error);
    }
  }

  public async cancelTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await this.makeRequest<Record<string, any>>('POST', `/orders/${transactionId}/cancel`);
      
      return this.updateTransaction(transactionId, {
        status: TransactionStatus.CANCELLED,
        metadata: {
          ...response.order,
          cancelled_at: new Date()
        }
      });
    } catch (error) {
      logger.error('Error cancelling transaction:', error);
      throw this.createError('Failed to cancel transaction', error);
    }
  }

  public async validateWebhookSignature(
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    try {
      const expectedSignature = this.generateSignature(payload);
      return signature === expectedSignature;
    } catch (error) {
      logger.error('Error validating webhook signature:', error);
      return false;
    }
  }

  private generateSignature(payload?: Record<string, any>): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const data = payload ? JSON.stringify(payload) : '';
    const message = `${timestamp}${data}`;
    
    return crypto
      .createHmac('sha256', this.config.settings.secretKey || '')
      .update(message)
      .digest('hex');
  }
} 