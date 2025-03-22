import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class SystemeService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.systeme.io'
      : 'https://api.systeme.io';
    this.headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
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
      console.error('Erro ao buscar pedidos do Systeme:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.id.toString(),
      platformId: 'systeme',
      orderId: order.order_number,
      amount: order.total_amount,
      currency: order.currency || 'BRL',
      status: order.status === 'completed' ? 'completed' : 'pending',
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
        billingAddress: order.billing_address,
        affiliateId: order.affiliate_id,
        campaignId: order.campaign_id,
      },
    };
  }

  async syncTransactions(): Promise<void> {
    try {
      const orders = await this.fetchOrders();
      for (const order of orders) {
        await this.saveTransaction(order);
      }
    } catch (error) {
      console.error('Erro ao sincronizar transações do Systeme:', error);
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
          events: ['order.created', 'order.updated', 'order.completed'],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no Systeme:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      const transaction = this.mapOrderToTransaction(payload.data);
      await this.saveTransaction(transaction);
    } catch (error) {
      console.error('Erro ao processar webhook do Systeme:', error);
      throw error;
    }
  }
} 