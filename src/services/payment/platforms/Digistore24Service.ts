import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class Digistore24Service extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.digistore24.com'
      : 'https://api.digistore24.com';
    this.headers = {
      'Content-Type': 'application/json',
      'X-DS-API-KEY': apiKey,
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/sales`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.sales.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar pedidos do Digistore24:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.sale_id.toString(),
      platformId: 'digistore24',
      orderId: order.order_id,
      amount: order.total_amount,
      currency: order.currency,
      status: this.mapStatus(order.status),
      customer: {
        name: `${order.customer.first_name} ${order.customer.last_name}`,
        email: order.customer.email,
        phone: order.customer.phone,
      },
      product: {
        id: order.product.id.toString(),
        name: order.product.name,
        price: order.product.price,
        quantity: order.product.quantity,
      },
      paymentMethod: order.payment_method,
      createdAt: new Date(order.created_at * 1000), // Digistore24 usa timestamp Unix
      updatedAt: new Date(order.updated_at * 1000),
      metadata: {
        product: {
          description: order.product.description,
          category: order.product.category,
          language: order.product.language,
        },
        customer: {
          country: order.customer.country,
          language: order.customer.language,
          ip_country: order.customer.ip_country,
        },
        affiliate: {
          id: order.affiliate.id,
          name: order.affiliate.name,
          commission: order.affiliate.commission,
        },
        payment: {
          installments: order.payment.installments,
          installment_amount: order.payment.installment_amount,
          payment_plan: order.payment.plan,
        },
        marketing: {
          funnel_id: order.marketing.funnel_id,
          funnel_name: order.marketing.funnel_name,
          source: order.marketing.source,
          campaign: order.marketing.campaign,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'completed';
      case 'pending':
      case 'processing':
        return 'pending';
      case 'cancelled':
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
      console.error('Erro ao sincronizar transações do Digistore24:', error);
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
            'sale.created',
            'sale.completed',
            'sale.cancelled',
            'sale.refunded',
            'sale.chargeback',
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no Digistore24:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      if (payload.event.startsWith('sale.')) {
        const transaction = this.mapOrderToTransaction(payload.data);
        await this.saveTransaction(transaction);
      }
    } catch (error) {
      console.error('Erro ao processar webhook do Digistore24:', error);
      throw error;
    }
  }
} 