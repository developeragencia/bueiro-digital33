import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class MundPayService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.mundpay.com'
      : 'https://api.mundpay.com';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Account-Token': secretKey,
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/orders`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.orders.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar pedidos do MundPay:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.id.toString(),
      platformId: 'mundpay',
      orderId: order.reference_id,
      amount: order.amount,
      currency: order.currency || 'BRL',
      status: this.mapStatus(order.status),
      customer: {
        name: order.customer.full_name,
        email: order.customer.email,
        phone: order.customer.phone,
        document: order.customer.document,
      },
      product: {
        id: order.items[0].id,
        name: order.items[0].name,
        price: order.items[0].unit_amount,
        quantity: order.items[0].quantity,
      },
      paymentMethod: order.payment_method.type,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      metadata: {
        items: order.items,
        payment: {
          installments: order.payment_method.installments,
          installmentAmount: order.payment_method.installment_amount,
          paymentLink: order.payment_method.payment_link,
          pixQrCode: order.payment_method.pix?.qr_code,
          pixKey: order.payment_method.pix?.key,
          boletoUrl: order.payment_method.boleto?.url,
          boletoBarcode: order.payment_method.boleto?.barcode,
          cardBrand: order.payment_method.card?.brand,
          cardLastFour: order.payment_method.card?.last4,
        },
        customer: {
          address: {
            street: order.customer.address.street,
            number: order.customer.address.number,
            complement: order.customer.address.complement,
            neighborhood: order.customer.address.neighborhood,
            city: order.customer.address.city,
            state: order.customer.address.state,
            zipcode: order.customer.address.postal_code,
            country: order.customer.address.country,
          },
        },
        affiliate: {
          id: order.affiliate?.id,
          name: order.affiliate?.name,
          commission: order.affiliate?.commission,
          commissionAmount: order.affiliate?.commission_amount,
        },
        split: {
          rules: order.split_rules,
          totalAmount: order.split_amount,
        },
        antifraud: {
          score: order.antifraud?.score,
          status: order.antifraud?.status,
          recommendation: order.antifraud?.recommendation,
          reasons: order.antifraud?.reasons,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'approved':
      case 'captured':
      case 'completed':
        return 'completed';
      case 'pending':
      case 'waiting_payment':
      case 'in_process':
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
      const orders = await this.fetchOrders();
      for (const order of orders) {
        await this.saveTransaction(order);
      }
    } catch (error) {
      console.error('Erro ao sincronizar transações do MundPay:', error);
      throw error;
    }
  }

  async createWebhook(url: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/v2/webhooks`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          url,
          events: [
            'order.created',
            'order.paid',
            'order.cancelled',
            'order.refunded',
            'order.chargeback',
            'order.chargeback_reversed',
            'order.expired',
            'order.failed',
            'affiliate.commission_paid',
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
      console.error('Erro ao criar webhook no MundPay:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      if (payload.event.startsWith('order.')) {
        const transaction = this.mapOrderToTransaction(payload.data);
        await this.saveTransaction(transaction);
      }
    } catch (error) {
      console.error('Erro ao processar webhook do MundPay:', error);
      throw error;
    }
  }
} 