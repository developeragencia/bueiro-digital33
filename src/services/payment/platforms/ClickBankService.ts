import { Transaction } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';

export class ClickBankService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://api.sandbox.clickbank.com/rest/1.3';
  private readonly PRODUCTION_API_URL = 'https://api.clickbank.com/rest/1.3';

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
      'CB-Version': '1.3',
      'CB-Access-Key': this.apiKey,
      'CB-Access-Signature': this.generateSignature()
    };
  }

  async processPayment(amount: number, currency: string, customer: Transaction['customer'], metadata?: Record<string, any>): Promise<Transaction> {
    this.validateApiKey();
    this.validateSecretKey();

    try {
      const response = await fetch(`${this.getApiUrl()}/orders/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount,
          currency,
          customer: {
            firstName: customer.name.split(' ')[0],
            lastName: customer.name.split(' ').slice(1).join(' '),
            email: customer.email,
            phone: customer.phone,
            ipAddress: metadata?.ipAddress || '127.0.0.1'
          },
          product: {
            itemNo: metadata?.productId || '',
            productTitle: metadata?.productName || '',
            recurring: metadata?.recurring || false
          },
          ...metadata
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        platform_id: this.platformId,
        order_id: data.receipt,
        amount,
        currency,
        status: this.mapStatus(data.transactionStatus),
        customer,
        payment_method: 'credit_card',
        metadata: {
          ...metadata,
          clickbank_id: data.receipt,
          vendor: data.vendor,
          affiliate: data.affiliate,
          lineItems: data.lineItems
        }
      };

      return this.saveTransaction(transaction);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async processRefund(transactionId: string): Promise<boolean> {
    this.validateApiKey();
    this.validateSecretKey();

    try {
      const response = await fetch(`${this.getApiUrl()}/orders/refund`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          receipt: transactionId,
          reason: 'Customer request'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'SUCCESS') {
        await this.updateTransactionStatus(transactionId, 'refunded');
        return true;
      }

      return false;
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

  private generateSignature(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const data = `${this.apiKey}${timestamp}`;
    return require('crypto')
      .createHmac('sha256', this.secretKey!)
      .update(data)
      .digest('hex');
  }

  private mapStatus(status: string): Transaction['status'] {
    const statusMap: Record<string, Transaction['status']> = {
      'COMPLETED': 'completed',
      'PENDING': 'pending',
      'PROCESSING': 'processing',
      'FAILED': 'failed',
      'REFUNDED': 'refunded',
      'REVERSED': 'refunded',
      'CANCELLED': 'cancelled'
    };

    return statusMap[status] || 'pending';
  }
} 
} 