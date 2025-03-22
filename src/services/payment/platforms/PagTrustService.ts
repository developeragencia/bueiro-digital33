import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class PagTrustService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.pagtrust.com.br'
      : 'https://api.pagtrust.com.br';
    this.headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Merchant-Id': secretKey,
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/transactions`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.transactions.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar transações do PagTrust:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(transaction: any): Transaction {
    return {
      id: transaction.id.toString(),
      platformId: 'pagtrust',
      orderId: transaction.order_id,
      amount: transaction.amount,
      currency: transaction.currency || 'BRL',
      status: this.mapStatus(transaction.status),
      customer: {
        name: transaction.customer.name,
        email: transaction.customer.email,
        phone: transaction.customer.phone,
        document: transaction.customer.document,
      },
      product: {
        id: transaction.product.id,
        name: transaction.product.name,
        price: transaction.product.price,
        quantity: transaction.product.quantity,
      },
      paymentMethod: transaction.payment_method,
      createdAt: new Date(transaction.created_at),
      updatedAt: new Date(transaction.updated_at),
      metadata: {
        payment: {
          installments: transaction.payment_details.installments,
          installmentAmount: transaction.payment_details.installment_amount,
          paymentLink: transaction.payment_details.payment_link,
          pixQrCode: transaction.payment_details.pix_qr_code,
          pixKey: transaction.payment_details.pix_key,
          boletoUrl: transaction.payment_details.boleto_url,
          boletoBarcode: transaction.payment_details.boleto_barcode,
          cardBrand: transaction.payment_details.card_brand,
          cardLastFour: transaction.payment_details.card_last_four,
        },
        customer: {
          address: transaction.customer.address,
          city: transaction.customer.city,
          state: transaction.customer.state,
          zipcode: transaction.customer.zipcode,
          country: transaction.customer.country,
        },
        seller: {
          id: transaction.seller?.id,
          name: transaction.seller?.name,
          commission: transaction.seller?.commission,
          commissionAmount: transaction.seller?.commission_amount,
        },
        subscription: {
          id: transaction.subscription?.id,
          status: transaction.subscription?.status,
          plan: transaction.subscription?.plan,
          interval: transaction.subscription?.interval,
          intervalCount: transaction.subscription?.interval_count,
          startDate: transaction.subscription?.start_date,
          endDate: transaction.subscription?.end_date,
        },
        fraud: {
          score: transaction.fraud_analysis?.score,
          status: transaction.fraud_analysis?.status,
          recommendation: transaction.fraud_analysis?.recommendation,
          details: transaction.fraud_analysis?.details,
        },
        split: {
          enabled: transaction.split?.enabled,
          rules: transaction.split?.rules,
          amounts: transaction.split?.amounts,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'captured':
      case 'completed':
        return 'completed';
      case 'pending':
      case 'waiting_payment':
      case 'processing':
      case 'authorized':
        return 'pending';
      case 'cancelled':
      case 'refunded':
      case 'chargeback':
      case 'expired':
      case 'declined':
      case 'failed':
      default:
        return 'failed';
    }
  }

  async syncTransactions(): Promise<void> {
    try {
      const transactions = await this.fetchOrders();
      for (const transaction of transactions) {
        await this.saveTransaction(transaction);
      }
    } catch (error) {
      console.error('Erro ao sincronizar transações do PagTrust:', error);
      throw error;
    }
  }

  async createWebhook(url: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/webhooks`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          url,
          events: [
            'transaction.created',
            'transaction.authorized',
            'transaction.paid',
            'transaction.failed',
            'transaction.cancelled',
            'transaction.refunded',
            'transaction.chargeback',
            'subscription.created',
            'subscription.activated',
            'subscription.cancelled',
            'subscription.expired',
            'split.processed',
          ],
          active: true,
          description: 'Webhook para integração com sistema de gestão',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no PagTrust:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      if (payload.event.startsWith('transaction.')) {
        const transaction = this.mapOrderToTransaction(payload.data);
        await this.saveTransaction(transaction);
      }
    } catch (error) {
      console.error('Erro ao processar webhook do PagTrust:', error);
      throw error;
    }
  }
} 