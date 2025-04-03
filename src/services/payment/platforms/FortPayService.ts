import { PlatformConfig, Transaction } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';

export class FortPayService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://api.sandbox.fortpay.com/v1';
  private readonly PRODUCTION_API_URL = 'https://api.fortpay.com/v1';

  constructor(config: PlatformConfig) {
    super(config);
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
      'Authorization': `Bearer ${this.apiKey}`
    };
  }

  async processPayment(data: Record<string, any>): Promise<Transaction> {
    this.validateApiKey();

    try {
      const response = await fetch(`${this.getApiUrl()}/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          customer: {
            name: data.customer?.name || '',
            email: data.customer?.email || '',
            document: data.customer?.document || '',
            phone: data.customer?.phone || ''
          },
          payment_method: data.metadata?.payment_method || 'credit_card',
          installments: data.metadata?.installments || 1,
          ...data.metadata
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        user_id: data.user_id,
        platform_id: this.config.platformId,
        platform_type: 'fortpay',
        platform_settings: this.config.settings,
        order_id: responseData.id,
        amount: data.amount,
        currency: data.currency,
        status: this.mapStatus(responseData.status),
        customer: data.customer,
        payment_method: responseData.payment_method,
        metadata: {
          ...data.metadata,
          fortpay_id: responseData.id,
          payment_url: responseData.payment_url,
          invoice_url: responseData.invoice_url
        }
      };

      return await this.saveTransaction(transaction);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async processRefund(transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    this.validateApiKey();

    try {
      const transaction = await this.getTransaction(transactionId);

      const response = await fetch(`${this.getApiUrl()}/refunds`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          payment_id: transactionId,
          amount: amount || transaction.amount,
          reason: reason || 'customer_request'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

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
          refund_id: responseData.id,
          refund_amount: amount || transaction.amount,
          refund_reason: reason || 'customer_request',
          refund_date: new Date().toISOString()
        }
      };

      return await this.saveTransaction(refundedTransaction);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async validateWebhook(payload: Record<string, any>, signature: string): Promise<boolean> {
    this.validateSecretKey();
    const calculatedSignature = this.calculateSignature(payload);
    return calculatedSignature === signature;
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await fetch(`${this.getApiUrl()}/payments/${transactionId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        id: transactionId,
        user_id: data.user_id,
        platform_id: this.config.platformId,
        platform_type: 'fortpay',
        platform_settings: this.config.settings,
        order_id: data.id,
        amount: data.amount,
        currency: data.currency,
        status: this.mapStatus(data.status),
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          document: data.customer.document,
          phone: data.customer.phone
        },
        payment_method: data.payment_method,
        metadata: {
          fortpay_id: data.id,
          payment_url: data.payment_url,
          invoice_url: data.invoice_url
        },
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate.toISOString());
      if (endDate) params.append('end_date', endDate.toISOString());

      const response = await fetch(`${this.getApiUrl()}/payments?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.payments.map((payment: any) => ({
        id: payment.id,
        user_id: payment.user_id,
        platform_id: this.config.platformId,
        platform_type: 'fortpay',
        platform_settings: this.config.settings,
        order_id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: this.mapStatus(payment.status),
        customer: {
          name: payment.customer.name,
          email: payment.customer.email,
          document: payment.customer.document,
          phone: payment.customer.phone
        },
        payment_method: payment.payment_method,
        metadata: {
          fortpay_id: payment.id,
          payment_url: payment.payment_url,
          invoice_url: payment.invoice_url
        },
        created_at: new Date(payment.created_at),
        updated_at: new Date(payment.updated_at)
      }));
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async getStatus(): Promise<PlatformStatusData> {
    try {
      const response = await fetch(`${this.getApiUrl()}/status`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        platform_id: this.config.platformId,
        is_active: data.is_active,
        uptime: data.uptime,
        error_rate: data.error_rate,
        last_check: new Date(),
        status: data.is_active ? 'active' : 'inactive'
      };
    } catch (error) {
      return {
        platform_id: this.config.platformId,
        is_active: false,
        uptime: 0,
        error_rate: 1,
        last_check: new Date(),
        status: 'inactive'
      };
    }
  }

  async updateConfig(config: Partial<PlatformConfig>): Promise<void> {
    this.config = {
      ...this.config,
      ...config
    };
  }

  private calculateSignature(payload: any): string {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return require('crypto')
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
  }
} 