import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class FortPayService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.fortpay.com.br'
      : 'https://api.fortpay.com.br';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
      console.error('Erro ao buscar pedidos do FortPay:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.transaction_id,
      platformId: 'fortpay',
      orderId: order.order_id,
      amount: order.amount,
      currency: 'BRL',
      status: this.mapStatus(order.status),
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        document: order.customer.document,
      },
      product: {
        id: order.product.id,
        name: order.product.name,
        price: order.product.price,
        quantity: order.product.quantity,
      },
      paymentMethod: order.payment_method,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      metadata: {
        payment: {
          installments: order.payment_details.installments,
          installmentAmount: order.payment_details.installment_amount,
          cardBrand: order.payment_details.card_brand,
          cardLastDigits: order.payment_details.card_last_digits,
          pixQrCode: order.payment_details.pix_qr_code,
          pixKey: order.payment_details.pix_key,
          boletoUrl: order.payment_details.boleto_url,
          boletoBarcode: order.payment_details.boleto_barcode,
        },
        customer: {
          ip: order.customer.ip,
          userAgent: order.customer.user_agent,
          address: order.customer.address,
        },
        affiliate: {
          id: order.affiliate.id,
          name: order.affiliate.name,
          commission: order.affiliate.commission,
        },
        antifraud: {
          score: order.antifraud.score,
          recommendation: order.antifraud.recommendation,
          analysis: order.antifraud.analysis,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'captured':
      case 'paid':
        return 'completed';
      case 'pending':
      case 'waiting_payment':
      case 'in_analysis':
        return 'pending';
      case 'cancelled':
      case 'declined':
      case 'refunded':
      case 'chargeback':
      default:
        return 'failed';
    }
  }

  async syncTransactions(): Promise<void> {
    try {
      const orders = await this.fetchOrders();
      for (const order of orders) {
        await this.saveTransaction(order);
      }
    } catch (error) {
      console.error('Erro ao sincronizar transações do FortPay:', error);
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
            'transaction.approved',
            'transaction.captured',
            'transaction.cancelled',
            'transaction.refunded',
            'transaction.chargeback',
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no FortPay:', error);
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
      console.error('Erro ao processar webhook do FortPay:', error);
      throw error;
    }
  }
} 