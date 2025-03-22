import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class HublaService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.hubla.com.br'
      : 'https://api.hubla.com.br';
    this.headers = {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Secret-Key': secretKey,
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
      console.error('Erro ao buscar vendas do Hubla:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(sale: any): Transaction {
    return {
      id: sale.id.toString(),
      platformId: 'hubla',
      orderId: sale.reference_id,
      amount: sale.amount,
      currency: sale.currency || 'BRL',
      status: this.mapStatus(sale.status),
      customer: {
        name: sale.customer.name,
        email: sale.customer.email,
        phone: sale.customer.phone,
        document: sale.customer.document,
      },
      product: {
        id: sale.product.id,
        name: sale.product.name,
        price: sale.product.price,
        quantity: sale.product.quantity,
      },
      paymentMethod: sale.payment_method,
      createdAt: new Date(sale.created_at),
      updatedAt: new Date(sale.updated_at),
      metadata: {
        payment: {
          installments: sale.payment_details.installments,
          installmentAmount: sale.payment_details.installment_amount,
          paymentLink: sale.payment_details.payment_link,
          pixQrCode: sale.payment_details.pix_qr_code,
          pixKey: sale.payment_details.pix_key,
          boletoUrl: sale.payment_details.boleto_url,
          boletoBarcode: sale.payment_details.boleto_barcode,
          cardBrand: sale.payment_details.card_brand,
          cardLastFour: sale.payment_details.card_last_four,
        },
        customer: {
          address: sale.customer.address,
          city: sale.customer.city,
          state: sale.customer.state,
          zipcode: sale.customer.zipcode,
          country: sale.customer.country,
        },
        producer: {
          id: sale.producer?.id,
          name: sale.producer?.name,
          commission: sale.producer?.commission,
          commissionAmount: sale.producer?.commission_amount,
        },
        affiliate: {
          id: sale.affiliate?.id,
          name: sale.affiliate?.name,
          commission: sale.affiliate?.commission,
          commissionAmount: sale.affiliate?.commission_amount,
          level: sale.affiliate?.level,
          parentId: sale.affiliate?.parent_id,
        },
        course: {
          id: sale.course?.id,
          name: sale.course?.name,
          type: sale.course?.type,
          platform: sale.course?.platform,
          accessDuration: sale.course?.access_duration,
        },
        membership: {
          id: sale.membership?.id,
          name: sale.membership?.name,
          type: sale.membership?.type,
          period: sale.membership?.period,
          startDate: sale.membership?.start_date,
          endDate: sale.membership?.end_date,
        },
        funnel: {
          id: sale.funnel?.id,
          name: sale.funnel?.name,
          step: sale.funnel?.step,
          source: sale.funnel?.source,
          medium: sale.funnel?.medium,
          campaign: sale.funnel?.campaign,
        },
      },
    };
  }

  private mapStatus(status: string): 'completed' | 'pending' | 'failed' {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'completed':
        return 'completed';
      case 'pending':
      case 'waiting_payment':
      case 'processing':
      case 'in_analysis':
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
      const sales = await this.fetchOrders();
      for (const sale of sales) {
        await this.saveTransaction(sale);
      }
    } catch (error) {
      console.error('Erro ao sincronizar transações do Hubla:', error);
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
            'sale.approved',
            'sale.cancelled',
            'sale.refunded',
            'sale.chargeback',
            'sale.expired',
            'membership.activated',
            'membership.cancelled',
            'membership.expired',
            'course.access_granted',
            'course.access_revoked',
            'commission.paid',
            'commission.cancelled',
          ],
          active: true,
          description: 'Webhook para integração com sistema de gestão',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no Hubla:', error);
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
      console.error('Erro ao processar webhook do Hubla:', error);
      throw error;
    }
  }
} 