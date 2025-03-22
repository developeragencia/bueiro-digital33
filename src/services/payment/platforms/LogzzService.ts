import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class LogzzService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.logzz.com.br'
      : 'https://api.logzz.com.br';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/orders`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.orders.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar pedidos do Logzz:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.id.toString(),
      platformId: 'logzz',
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
        id: order.items[0].sku,
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
          carrier: order.carrier,
          status: order.shipping_status,
        },
        warehouse: {
          id: order.warehouse_id,
          name: order.warehouse_name,
        },
        affiliateInfo: {
          id: order.affiliate_id,
          name: order.affiliate_name,
          commission: order.affiliate_commission,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'delivered':
      case 'completed':
        return 'completed';
      case 'pending':
      case 'processing':
      case 'in_transit':
        return 'pending';
      case 'cancelled':
      case 'returned':
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
      console.error('Erro ao sincronizar transações do Logzz:', error);
      throw error;
    }
  }

  async createWebhook(url: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/webhooks`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          url,
          events: [
            'order.created',
            'order.paid',
            'order.shipped',
            'order.delivered',
            'order.cancelled',
            'order.returned',
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no Logzz:', error);
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
      console.error('Erro ao processar webhook do Logzz:', error);
      throw error;
    }
  }
} 