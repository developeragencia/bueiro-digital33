import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class ShopifyService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.shopify.com'
      : 'https://api.shopify.com';
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': apiKey,
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/2024-01/orders.json`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.orders.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar pedidos do Shopify:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.id.toString(),
      platformId: 'shopify',
      orderId: order.order_number.toString(),
      amount: parseFloat(order.total_price),
      currency: order.currency,
      status: order.financial_status === 'paid' ? 'completed' : 'pending',
      customer: {
        name: `${order.customer.first_name} ${order.customer.last_name}`,
        email: order.customer.email,
        phone: order.customer.phone,
      },
      product: {
        id: order.line_items[0].product_id.toString(),
        name: order.line_items[0].title,
        price: parseFloat(order.line_items[0].price),
        quantity: order.line_items[0].quantity,
      },
      paymentMethod: order.payment_gateway_names[0] || 'unknown',
      createdAt: new Date(order.created_at),
      updatedAt: new Date(order.updated_at),
      metadata: {
        tags: order.tags,
        note: order.note,
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
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
      console.error('Erro ao sincronizar transações do Shopify:', error);
      throw error;
    }
  }

  async createWebhook(url: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          webhook: {
            topic: 'orders/create',
            address: url,
            format: 'json',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no Shopify:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      const transaction = this.mapOrderToTransaction(payload);
      await this.saveTransaction(transaction);
    } catch (error) {
      console.error('Erro ao processar webhook do Shopify:', error);
      throw error;
    }
  }
} 