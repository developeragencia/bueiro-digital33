import { Transaction } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';

export class HublaService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.api.hubla.com.br/v1';
  private readonly PRODUCTION_API_URL = 'https://api.hubla.com.br/v1';

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
      'X-Hubla-Key': this.apiKey,
      'X-Hubla-Signature': this.generateSignature()
    };
  }

  async processPayment(amount: number, currency: string, customer: Transaction['customer'], metadata?: Record<string, any>): Promise<Transaction> {
    this.validateApiKey();

    try {
      const response = await fetch(`${this.getApiUrl()}/transactions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          amount,
          currency,
          customer: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            document: customer.document,
            address: metadata?.address
          },
          product: {
            id: metadata?.productId,
            name: metadata?.productName,
            price: amount,
            quantity: metadata?.quantity || 1
          },
          payment: {
            method: metadata?.paymentMethod || 'credit_card',
            installments: metadata?.installments || 1,
            card: metadata?.card
          },
          notification_url: metadata?.notificationUrl,
          ...metadata
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        platform_id: this.platformId,
        order_id: data.transaction_id,
        amount,
        currency,
        status: this.mapStatus(data.status),
        customer,
        payment_method: data.payment_method,
        metadata: {
          ...metadata,
          hubla_id: data.id,
          payment_url: data.payment_url,
          invoice_url: data.invoice_url,
          boleto_url: data.boleto_url,
          pix_qrcode: data.pix_qrcode,
          pix_code: data.pix_code,
          installments: data.installments,
          installment_amount: data.installment_amount,
          affiliate: data.affiliate,
          commission: data.commission,
          producer: data.producer,
          producer_commission: data.producer_commission
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
      const response = await fetch(`${this.getApiUrl()}/transactions/${transactionId}/refund`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
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
      'approved': 'completed',
      'pending': 'pending',
      'processing': 'processing',
      'failed': 'failed',
      'refunded': 'refunded',
      'partially_refunded': 'refunded',
      'cancelled': 'cancelled',
      'expired': 'failed',
      'chargeback': 'failed',
      'dispute': 'processing',
      'waiting_payment': 'pending',
      'analysis': 'processing'
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }
} 