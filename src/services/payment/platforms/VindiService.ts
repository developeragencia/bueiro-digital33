import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import { logger } from '../../../utils/logger';
import crypto from 'crypto';

const STATUS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class VindiService extends BasePlatformService {
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
      throw new Error('API key and secret key are required for Vindi service');
    }
  }

  protected getBaseUrl(): string {
    return this.config.settings.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL;
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.settings.apiKey}`,
      'X-Vindi-Signature': this.generateSignature()
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
      const response = await this.makeRequest<Record<string, any>>('POST', '/bills', {
        bill: {
          amount,
          currency,
          customer: paymentData.customer,
          payment_method: paymentMethod,
          ...paymentData
        }
      });

      return this.saveTransaction({
        user_id: paymentData.user_id,
        platform_id: this.config.platform_id,
        platform_type: 'vindi',
        platform_settings: this.config.settings,
        order_id: response.bill.id,
        amount,
        currency,
        status: this.mapStatus(response.bill.status),
        customer: paymentData.customer,
        payment_method: paymentMethod,
        metadata: {
          ...response.bill,
          vindi_bill_id: response.bill.id
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
      const response = await this.makeRequest<Record<string, any>>('POST', `/bills/${transaction.order_id}/refunds`, {
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
          vindi_refund_id: response.refund.id
        }
      });
    } catch (error) {
      logger.error('Error refunding transaction:', error);
      throw this.createError('Failed to refund transaction', error);
    }
  }

  public async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await this.makeRequest<Record<string, any>>('GET', `/bills/${transactionId}`);
      return {
        id: transactionId,
        user_id: response.bill.customer.id,
        platform_id: this.config.platform_id,
        platform_type: 'vindi',
        platform_settings: this.config.settings,
        order_id: response.bill.id,
        amount: response.bill.amount,
        currency: response.bill.currency as Currency,
        status: this.mapStatus(response.bill.status),
        customer: {
          name: response.bill.customer.name,
          email: response.bill.customer.email,
          document: response.bill.customer.document,
          phone: response.bill.customer.phone
        },
        payment_method: response.bill.payment_method as PaymentMethod,
        metadata: {
          ...response.bill,
          vindi_bill_id: response.bill.id
        },
        created_at: new Date(response.bill.created_at),
        updated_at: new Date(response.bill.updated_at)
      };
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw this.createError('Failed to get transaction', error);
    }
  }

  public async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      const response = await this.makeRequest<Record<string, any>[]>('GET', '/bills', undefined, {
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString()
      });

      return response.map(bill => ({
        id: bill.id,
        user_id: bill.customer.id,
        platform_id: this.config.platform_id,
        platform_type: 'vindi',
        platform_settings: this.config.settings,
        order_id: bill.id,
        amount: bill.amount,
        currency: bill.currency as Currency,
        status: this.mapStatus(bill.status),
        customer: {
          name: bill.customer.name,
          email: bill.customer.email,
          document: bill.customer.document,
          phone: bill.customer.phone
        },
        payment_method: bill.payment_method as PaymentMethod,
        metadata: {
          ...bill,
          vindi_bill_id: bill.id
        },
        created_at: new Date(bill.created_at),
        updated_at: new Date(bill.updated_at)
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
      const response = await this.makeRequest<Record<string, any>>('GET', '/status');
      
      const status: PlatformStatusData = {
        is_active: response.is_active,
        error_rate: response.error_rate || 0,
        status: this.mapStatus(response.status),
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
      const response = await this.makeRequest<Record<string, any>>('POST', `/bills/${transactionId}/cancel`);
      
      return this.updateTransaction(transactionId, {
        status: TransactionStatus.CANCELLED,
        metadata: {
          ...response.bill,
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