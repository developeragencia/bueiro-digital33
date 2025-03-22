import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class AppmaxService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.appmax.com.br'
      : 'https://api.appmax.com.br';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Secret-Key': secretKey,
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/orders`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar pedidos do Appmax:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.id.toString(),
      platformId: 'appmax',
      orderId: order.order_number,
      amount: order.total_amount,
      currency: 'BRL',
      status: this.mapStatus(order.status),
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      },
      product: {
        id: order.items[0].product_id.toString(),
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
        tracking: order.tracking_code,
        affiliateId: order.affiliate_id,
        utm: {
          source: order.utm_source,
          medium: order.utm_medium,
          campaign: order.utm_campaign,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return 'completed';
      case 'pending':
      case 'waiting_payment':
      case 'in_analysis':
        return 'pending';
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
      console.error('Erro ao sincronizar transações do Appmax:', error);
      throw error;
    }
  }

  async createWebhook(url: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v3/webhooks`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          url,
          events: [
            'order.created',
            'order.approved',
            'order.canceled',
            'order.refunded',
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no Appmax:', error);
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
      console.error('Erro ao processar webhook do Appmax:', error);
      throw error;
    }
  }
} 