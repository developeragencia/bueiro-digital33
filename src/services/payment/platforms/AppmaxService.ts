import { Transaction, TransactionStatus } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';
import crypto from 'crypto';

export class AppmaxService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.appmax.com.br/api/v1';
  private readonly PRODUCTION_API_URL = 'https://appmax.com.br/api/v1';

  constructor(platformId: string, apiKey: string, secretKey?: string, sandbox: boolean = true) {
    super(platformId, apiKey, secretKey, sandbox);
  }

  protected getSandboxApiUrl(): string {
    return this.SANDBOX_API_URL;
  }

  protected getProductionApiUrl(): string {
    return this.PRODUCTION_API_URL;
  }

  async processPayment(
    amount: number,
    currency: string,
    customer: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    const url = `${this.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL}/sales`;

    try {
      const response = await axios.post(url, {
        amount,
        currency,
        customer,
        metadata
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        platform_id: this.platformId,
        platform_type: 'appmax',
        platform_settings: {
          apiKey: this.apiKey,
          secretKey: this.secretKey,
          sandbox: this.sandbox
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
        metadata: metadata || {}
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to process payment with Appmax: ${error.message}`);
      }
      throw new Error('Failed to process payment with Appmax');
    }
  }

  async processRefund(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction> {
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

      return {
        platform_id: this.platformId,
        platform_type: 'appmax',
        platform_settings: {
          apiKey: this.apiKey,
          secretKey: this.secretKey,
          sandbox: this.sandbox
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
        metadata: {
          refund_reason: reason
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to process refund with Appmax: ${error.message}`);
      }
      throw new Error('Failed to process refund with Appmax');
    }
  }

  async validateWebhook(payload: Record<string, any>, signature: string): Promise<boolean> {
    const calculatedSignature = this.calculateSignature(JSON.stringify(payload));
    return calculatedSignature === signature;
  }

  async getTransaction(orderId: string): Promise<Record<string, any>> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    const url = `${this.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL}/orders/${orderId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        amount: response.data.amount,
        currency: response.data.currency,
        status: this.mapStatus(response.data.status),
        payment_method: response.data.payment_method,
        customer: {
          name: response.data.customer.name,
          email: response.data.customer.email,
          phone: response.data.customer.phone,
          document: response.data.customer.document
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get transaction from Appmax: ${error.message}`);
      }
      throw new Error('Failed to get transaction from Appmax');
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

  private mapStatus(platformStatus: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'pending': 'pending',
      'processing': 'processing',
      'completed': 'completed',
      'failed': 'failed',
      'refunded': 'refunded',
      'cancelled': 'cancelled'
    };

    return statusMap[platformStatus] || 'unknown';
  }
} 