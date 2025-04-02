import { Transaction } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';

export class CartPandaService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.cartpanda.com.br/api/v1';
  private readonly PRODUCTION_API_URL = 'https://api.cartpanda.com.br/v1';

  constructor(platformId: string, apiKey: string, secretKey?: string, sandbox: boolean = true) {
    super(platformId, apiKey, secretKey, sandbox);
  }

  protected getSandboxApiUrl(): string {
    return this.SANDBOX_API_URL;
  }

  protected getProductionApiUrl(): string {
    return this.PRODUCTION_API_URL;
  }

  async processPayment(amount: number, currency: string, customer: Transaction['customer'], metadata?: Record<string, any>): Promise<Transaction> {
    this.validateApiKey();

    try {
      const response = await fetch(`${this.getApiUrl()}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount,
          currency,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            document: customer.document
          },
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        platform_id: this.platformId,
        order_id: data.order_id,
        amount,
        currency,
        status: this.mapStatus(data.status),
        customer,
        payment_method: data.payment_method,
        metadata: {
          ...metadata,
          cartpanda_id: data.id,
          payment_url: data.payment_url
        }
      };

      return this.saveTransaction(transaction);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async processRefund(transactionId: string): Promise<boolean> {
    this.validateApiKey();

    try {
      const response = await fetch(`${this.getApiUrl()}/refunds`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          transaction_id: transactionId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        await this.updateTransactionStatus(transactionId, 'refunded');
      }

      return data.success || false;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  validateWebhook(payload: any, signature: string): boolean {
    this.validateSecretKey();

    const calculatedSignature = this.calculateSignature(payload);
    return calculatedSignature === signature;
  }

  private calculateSignature(payload: any): string {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return require('crypto')
      .createHmac('sha256', this.secretKey!)
      .update(data)
      .digest('hex');
  }

  private mapStatus(status: string): Transaction['status'] {
    const statusMap: Record<string, Transaction['status']> = {
      'pending': 'pending',
      'processing': 'processing',
      'completed': 'completed',
      'failed': 'failed',
      'refunded': 'refunded',
      'cancelled': 'cancelled'
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }
} 