import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class ClickBankService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.clickbank.com'
      : 'https://api.clickbank.com';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'CB-Version': '2.0',
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/1.3/orders`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.orders.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar pedidos do ClickBank:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.receipt,
      platformId: 'clickbank',
      orderId: order.transactionId,
      amount: order.totalOrderAmount,
      currency: order.currency || 'USD',
      status: this.mapStatus(order.status),
      customer: {
        name: order.customer.fullName,
        email: order.customer.email,
        phone: order.customer.phone,
        country: order.customer.country,
      },
      product: {
        id: order.lineItems[0].itemNo,
        name: order.lineItems[0].productTitle,
        price: order.lineItems[0].price,
        quantity: order.lineItems[0].quantity,
      },
      paymentMethod: order.paymentMethod,
      createdAt: new Date(order.transactionTime),
      updatedAt: new Date(order.lastUpdated),
      metadata: {
        vendor: {
          id: order.vendor.id,
          name: order.vendor.name,
          accountId: order.vendor.accountId,
        },
        affiliate: {
          id: order.affiliate.id,
          name: order.affiliate.name,
          commission: order.affiliate.commission,
        },
        upsell: {
          isUpsell: order.isUpsell,
          parentReceipt: order.parentReceipt,
          upsellFlow: order.upsellFlow,
        },
        tracking: {
          trackingId: order.trackingId,
          hopCount: order.hopCount,
          referringUrl: order.referringUrl,
        },
        subscription: {
          isRecurring: order.isRecurring,
          rebillStatus: order.rebillStatus,
          nextBillDate: order.nextBillDate,
          subscriptionId: order.subscriptionId,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'complete':
      case 'approved':
      case 'shipped':
        return 'completed';
      case 'pending':
      case 'processing':
        return 'pending';
      case 'refunded':
      case 'chargeback':
      case 'cancelled':
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
      console.error('Erro ao sincronizar transações do ClickBank:', error);
      throw error;
    }
  }

  async createWebhook(url: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/rest/1.3/notifications/endpoints`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          url,
          events: [
            'SALE',
            'BILL',
            'RFND',
            'CGBK',
            'CANCEL',
            'UNCANCEL',
            'TEST',
          ],
          status: 'ACTIVE',
          notificationVersion: '2.0',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no ClickBank:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      // ClickBank envia notificações IPN em formato específico
      const transaction = this.mapOrderToTransaction(payload.order);
      await this.saveTransaction(transaction);
    } catch (error) {
      console.error('Erro ao processar webhook do ClickBank:', error);
      throw error;
    }
  }
} 