import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class MaxWebService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.maxweb.com.br'
      : 'https://api.maxweb.com.br';
    this.headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Secret-Key': secretKey,
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/orders`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.orders.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar pedidos do MaxWeb:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.id.toString(),
      platformId: 'maxweb',
      orderId: order.order_number,
      amount: order.total_amount,
      currency: 'BRL',
      status: this.mapStatus(order.status),
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        document: order.customer.document,
      },
      product: {
        id: order.items[0].product_id,
        name: order.items[0].name,
        price: order.items[0].price,
        quantity: order.items[0].quantity,
      },
      paymentMethod: order.payment_method,
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      metadata: {
        items: order.items,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        tracking: {
          code: order.tracking_code,
          url: order.tracking_url,
          carrier: order.shipping_carrier,
        },
        affiliate: {
          id: order.affiliate_id,
          name: order.affiliate_name,
          commission: order.affiliate_commission,
        },
        campaign: {
          id: order.campaign_id,
          name: order.campaign_name,
          source: order.traffic_source,
        },
        utm: {
          source: order.utm_source,
          medium: order.utm_medium,
          campaign: order.utm_campaign,
          content: order.utm_content,
          term: order.utm_term,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'delivered':
        return 'completed';
      case 'pending':
      case 'waiting_payment':
      case 'in_transit':
        return 'pending';
      case 'cancelled':
      case 'refunded':
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
      console.error('Erro ao sincronizar transações do MaxWeb:', error);
      throw error;
    }
  }

  async createWebhook(url: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/webhooks`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          url,
          events: [
            'order.created',
            'order.approved',
            'order.paid',
            'order.shipped',
            'order.delivered',
            'order.cancelled',
            'order.refunded',
          ],
          active: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no MaxWeb:', error);
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
      console.error('Erro ao processar webhook do MaxWeb:', error);
      throw error;
    }
  }
} 