import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import axios from 'axios';
import crypto from 'crypto';

export class NitroService extends BasePlatformService {
  protected readonly SANDBOX_API_URL = 'https://sandbox.nitro.com/api/v1';
  protected readonly PRODUCTION_API_URL = 'https://api.nitro.com/api/v1';

  public getBaseUrl(): string {
    return this.config.settings?.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL;
  }

  public getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.settings?.apiKey || '',
      'X-Secret-Key': this.config.settings?.secretKey || ''
    };
  }

  private mapNitroStatus(status: string): TransactionStatus {
    switch (status.toLowerCase()) {
      case 'pending':
        return TransactionStatus.PENDING;
      case 'completed':
        return TransactionStatus.COMPLETED;
      case 'failed':
        return TransactionStatus.FAILED;
      case 'refunded':
        return TransactionStatus.REFUNDED;
      case 'cancelled':
        return TransactionStatus.CANCELLED;
      default:
        return TransactionStatus.PENDING;
    }
  }

  async processPayment(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/payments`,
        {
          amount,
          currency,
          payment_method: paymentMethod,
          ...paymentData
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        platform_type: 'nitro',
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        customer: response.data.customer,
        payment_method: response.data.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings?.webhookUrl,
          webhookSecret: this.config.settings?.webhookSecret,
          currency: this.config.settings?.currency,
          apiKey: this.config.settings?.apiKey,
          secretKey: this.config.settings?.secretKey,
          sandbox: this.config.settings?.sandbox,
          name: this.config.settings?.name
        },
        status: this.mapNitroStatus(response.data.status),
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        metadata: response.data.metadata
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async refundTransaction(
    transactionId: string,
    amount?: number
  ): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/refunds`,
        {
          transaction_id: transactionId,
          amount
        },
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        platform_type: 'nitro',
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        customer: response.data.customer,
        payment_method: response.data.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings?.webhookUrl,
          webhookSecret: this.config.settings?.webhookSecret,
          currency: this.config.settings?.currency,
          apiKey: this.config.settings?.apiKey,
          secretKey: this.config.settings?.secretKey,
          sandbox: this.config.settings?.sandbox,
          name: this.config.settings?.name
        },
        status: TransactionStatus.REFUNDED,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        metadata: response.data.metadata
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.post(
        `${this.getBaseUrl()}/transactions/${transactionId}/cancel`,
        {},
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        platform_type: 'nitro',
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        customer: response.data.customer,
        payment_method: response.data.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings?.webhookUrl,
          webhookSecret: this.config.settings?.webhookSecret,
          currency: this.config.settings?.currency,
          apiKey: this.config.settings?.apiKey,
          secretKey: this.config.settings?.secretKey,
          sandbox: this.config.settings?.sandbox,
          name: this.config.settings?.name
        },
        status: TransactionStatus.CANCELLED,
        created_at: new Date(response.data.created_at),
        updated_at: new Date(response.data.updated_at),
        metadata: response.data.metadata
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.get(
        `${this.getBaseUrl()}/transactions/${transactionId}`,
        { headers: this.getHeaders() }
      );

      return {
        id: response.data.id,
        platform_id: this.config.platform_id,
        platform_type: 'nitro',
        order_id: response.data.order_id,
        amount: response.data.amount,
        currency: response.data.currency,
        customer: response.data.customer,
        payment_method: response.data.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings?.webhookUrl,
          webhookSecret: this.config.settings?.webhookSecret,
          currency: this.config.settings?.currency,
          apiKey: this.config.settings?.apiKey,
          secretKey: this.config.settings?.secretKey,
          sandbox: this.config.settings?.sandbox,
          name: this.config.settings?.name
        },
        status: this.mapNitroStatus(response.data.status),
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

      const response = await axios.get(`${this.getBaseUrl()}/transactions`, {
        headers: this.getHeaders(),
        params
      });

      return response.data.map((tx: any) => ({
        id: tx.id,
        platform_id: this.config.platform_id,
        platform_type: 'nitro',
        order_id: tx.order_id,
        amount: tx.amount,
        currency: tx.currency,
        customer: tx.customer,
        payment_method: tx.payment_method,
        platform_settings: {
          webhookUrl: this.config.settings?.webhookUrl,
          webhookSecret: this.config.settings?.webhookSecret,
          currency: this.config.settings?.currency,
          apiKey: this.config.settings?.apiKey,
          secretKey: this.config.settings?.secretKey,
          sandbox: this.config.settings?.sandbox,
          name: this.config.settings?.name
        },
        status: this.mapNitroStatus(tx.status),
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
      const response = await axios.get(`${this.getBaseUrl()}/status`, {
        headers: this.getHeaders()
      });

      return {
        status: this.mapNitroStatus(response.data.status),
        error_rate: response.data.error_rate,
        is_active: response.data.is_active,
        last_checked: new Date()
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async validateWebhookSignature(signature: string, payload: Record<string, any>): Promise<boolean> {
    const calculatedSignature = this.calculateSignature();
    return calculatedSignature === signature;
  }

  private calculateSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = `${this.config.settings?.secretKey || ''}${timestamp}`;
    return crypto
      .createHmac('sha256', this.config.settings?.secretKey || '')
      .update(data)
      .digest('hex');
  }
} 