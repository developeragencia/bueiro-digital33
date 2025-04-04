import axios from 'axios';
import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod, ShopifyConfig } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import { logger } from '../../../utils/logger';
import crypto from 'crypto';

const STATUS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class ShopifyService extends BasePlatformService {
  protected config: ShopifyConfig;

  private statusCache: {
    data: PlatformStatusData | null;
    timestamp: number;
  } = {
    data: null,
    timestamp: 0
  };

  constructor(config: ShopifyConfig) {
    super(config);
    this.config = config;
    if (!config.settings.apiKey || !config.settings.secretKey) {
      throw new Error('API key and secret key are required for Shopify service');
    }
  }

  protected getSandboxApiUrl(): string {
    return `https://${this.config.settings.shopDomain}/admin/api/2024-01`;
  }

  protected getProductionApiUrl(): string {
    return `https://${this.config.settings.shopDomain}/admin/api/2024-01`;
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

  async processPayment(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction> {
    this.validatePaymentData(amount, currency, paymentMethod, paymentData);

    return this.retryRequest(async () => {
      try {
        const response = await axios.post(
          `${this.getBaseUrl()}/orders.json`,
          {
            order: {
              line_items: [{
                title: paymentData.description || 'Pagamento',
                price: amount,
                quantity: 1
              }],
              customer: {
                email: paymentData.customer.email,
                first_name: paymentData.customer.name?.split(' ')[0],
                last_name: paymentData.customer.name?.split(' ').slice(1).join(' '),
                phone: paymentData.customer.phone
              },
              financial_status: 'pending',
              currency,
              gateway: paymentMethod,
              ...paymentData
            }
          },
          { headers: this.getHeaders() }
        );

        return {
          id: response.data.order.id,
          platform_id: this.config.id,
          amount: response.data.order.total_price,
          currency: response.data.order.currency as Currency,
          status: this.mapShopifyStatus(response.data.order.financial_status),
          customer: {
            name: `${response.data.order.customer.first_name} ${response.data.order.customer.last_name}`,
            email: response.data.order.customer.email,
            phone: response.data.order.customer.phone
          },
          payment_method: paymentMethod,
          metadata: response.data.order,
          created_at: new Date(response.data.order.created_at),
          updated_at: new Date(response.data.order.updated_at)
        };
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  async refundTransaction(transactionId: string, amount?: number): Promise<Transaction> {
    return this.retryRequest(async () => {
      try {
        const order = await this.getTransaction(transactionId);
        
        const response = await axios.post(
          `${this.getBaseUrl()}/orders/${order.id}/refunds.json`,
          {
            refund: {
              notify: true,
              note: 'Reembolso solicitado',
              shipping: { full_refund: true },
              refund_line_items: [{
                line_item_id: order.metadata.line_items[0].id,
                quantity: 1,
                restock_type: 'no_restock'
              }],
              transactions: [{
                amount: amount || order.amount,
                kind: 'refund',
                gateway: order.payment_method
              }]
            }
          },
          { headers: this.getHeaders() }
        );

        return {
          id: response.data.refund.id,
          platform_id: this.config.id,
          amount: response.data.refund.transactions[0].amount,
          currency: order.currency,
          status: TransactionStatus.REFUNDED,
          customer: order.customer,
          payment_method: order.payment_method,
          metadata: response.data.refund,
          created_at: new Date(response.data.refund.created_at),
          updated_at: new Date(response.data.refund.processed_at)
        };
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    return this.retryRequest(async () => {
      try {
        const response = await axios.get(
          `${this.getBaseUrl()}/orders/${transactionId}.json`,
          { headers: this.getHeaders() }
        );

        return {
          id: response.data.order.id,
          platform_id: this.config.id,
          amount: response.data.order.total_price,
          currency: response.data.order.currency as Currency,
          status: this.mapShopifyStatus(response.data.order.financial_status),
          customer: {
            name: `${response.data.order.customer.first_name} ${response.data.order.customer.last_name}`,
            email: response.data.order.customer.email,
            phone: response.data.order.customer.phone
          },
          payment_method: response.data.order.gateway as PaymentMethod,
          metadata: response.data.order,
          created_at: new Date(response.data.order.created_at),
          updated_at: new Date(response.data.order.updated_at)
        };
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    return this.retryRequest(async () => {
      try {
        const params: Record<string, string> = {};
        if (startDate) params.created_at_min = startDate.toISOString();
        if (endDate) params.created_at_max = endDate.toISOString();

        const response = await axios.get(
          `${this.getBaseUrl()}/orders.json`,
          {
            headers: this.getHeaders(),
            params
          }
        );

        return response.data.orders.map((order: any) => ({
          id: order.id,
          platform_id: this.config.id,
          amount: order.total_price,
          currency: order.currency as Currency,
          status: this.mapShopifyStatus(order.financial_status),
          customer: {
            name: `${order.customer.first_name} ${order.customer.last_name}`,
            email: order.customer.email,
            phone: order.customer.phone
          },
          payment_method: order.gateway as PaymentMethod,
          metadata: order,
          created_at: new Date(order.created_at),
          updated_at: new Date(order.updated_at)
        }));
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  async getStatus(): Promise<PlatformStatusData> {
    const now = Date.now();
    if (this.statusCache.data && now - this.statusCache.timestamp < 5 * 60 * 1000) {
      return this.statusCache.data;
    }

    return this.retryRequest(async () => {
      try {
        const response = await axios.get(
          `${this.getBaseUrl()}/shop.json`,
          { headers: this.getHeaders() }
        );

        const statusData: PlatformStatusData = {
          is_active: response.data.shop.enabled_presentment_currencies.includes(Currency.BRL),
          error_rate: 0,
          last_checked: new Date(),
          platform_version: response.data.shop.shop_owner_version,
          api_version: '2024-01',
          status: response.data.shop.plan_name
        };

        this.statusCache = {
          data: statusData,
          timestamp: now
        };

        return statusData;
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  async cancelTransaction(transactionId: string): Promise<Transaction> {
    return this.retryRequest(async () => {
      try {
        const response = await axios.post(
          `${this.getBaseUrl()}/orders/${transactionId}/cancel.json`,
          {},
          { headers: this.getHeaders() }
        );

        return {
          id: response.data.order.id,
          platform_id: this.config.id,
          amount: response.data.order.total_price,
          currency: response.data.order.currency as Currency,
          status: TransactionStatus.CANCELLED,
          customer: {
            name: `${response.data.order.customer.first_name} ${response.data.order.customer.last_name}`,
            email: response.data.order.customer.email,
            phone: response.data.order.customer.phone
          },
          payment_method: response.data.order.gateway as PaymentMethod,
          metadata: response.data.order,
          created_at: new Date(response.data.order.created_at),
          updated_at: new Date(response.data.order.updated_at)
        };
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }

  async validateWebhookSignature(
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    try {
      const hmac = require('crypto')
        .createHmac('sha256', this.config.settings.webhookSecret)
        .update(Buffer.from(JSON.stringify(payload)), 'utf8')
        .digest('base64');

      return hmac === signature;
    } catch (error) {
      console.error('Erro ao validar assinatura do webhook:', error);
      return false;
    }
  }

  private mapShopifyStatus(status: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'pending': TransactionStatus.PENDING,
      'authorized': TransactionStatus.PROCESSING,
      'partially_paid': TransactionStatus.PROCESSING,
      'paid': TransactionStatus.COMPLETED,
      'partially_refunded': TransactionStatus.REFUNDED,
      'refunded': TransactionStatus.REFUNDED,
      'voided': TransactionStatus.CANCELLED,
      'failed': TransactionStatus.FAILED
    };

    return statusMap[status] || TransactionStatus.PENDING;
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