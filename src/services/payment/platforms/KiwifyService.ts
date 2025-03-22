import { PaymentPlatformService } from '../PaymentPlatformService';
import { Transaction } from '../../../types/payment';

export class KiwifyService extends PaymentPlatformService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super();
    this.baseUrl = sandbox
      ? 'https://api.sandbox.kiwify.com.br'
      : 'https://api.kiwify.com.br';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-Store-Id': secretKey,
    };
  }

  async fetchOrders(): Promise<Transaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/orders`, {
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.orders.map(this.mapOrderToTransaction);
    } catch (error) {
      console.error('Erro ao buscar pedidos do Kiwify:', error);
      throw error;
    }
  }

  private mapOrderToTransaction(order: any): Transaction {
    return {
      id: order.id.toString(),
      platformId: 'kiwify',
      orderId: order.reference_id,
      amount: order.amount,
      currency: order.currency || 'BRL',
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
          paymentLink: order.payment_details.payment_link,
          pixQrCode: order.payment_details.pix_qr_code,
          pixKey: order.payment_details.pix_key,
          boletoUrl: order.payment_details.boleto_url,
          boletoBarcode: order.payment_details.boleto_barcode,
          cardBrand: order.payment_details.card_brand,
          cardLastFour: order.payment_details.card_last_four,
        },
        customer: {
          address: order.customer.address,
          city: order.customer.city,
          state: order.customer.state,
          zipcode: order.customer.zipcode,
          country: order.customer.country,
        },
        producer: {
          id: order.producer?.id,
          name: order.producer?.name,
          commission: order.producer?.commission,
          commissionAmount: order.producer?.commission_amount,
        },
        affiliate: {
          id: order.affiliate?.id,
          name: order.affiliate?.name,
          commission: order.affiliate?.commission,
          commissionAmount: order.affiliate?.commission_amount,
          level: order.affiliate?.level,
          parentId: order.affiliate?.parent_id,
        },
        course: {
          id: order.course?.id,
          name: order.course?.name,
          type: order.course?.type,
          platform: order.course?.platform,
          accessDuration: order.course?.access_duration,
        },
        membership: {
          id: order.membership?.id,
          name: order.membership?.name,
          type: order.membership?.type,
          period: order.membership?.period,
          startDate: order.membership?.start_date,
          endDate: order.membership?.end_date,
        },
        funnel: {
          id: order.funnel?.id,
          name: order.funnel?.name,
          step: order.funnel?.step,
          source: order.funnel?.source,
          medium: order.funnel?.medium,
          campaign: order.funnel?.campaign,
        },
        tracking: {
          utmSource: order.tracking?.utm_source,
          utmMedium: order.tracking?.utm_medium,
          utmCampaign: order.tracking?.utm_campaign,
          utmTerm: order.tracking?.utm_term,
          utmContent: order.tracking?.utm_content,
          fbclid: order.tracking?.fbclid,
          gclid: order.tracking?.gclid,
        },
        checkout: {
          id: order.checkout?.id,
          type: order.checkout?.type,
          template: order.checkout?.template,
          customDomain: order.checkout?.custom_domain,
          abandonedCart: order.checkout?.abandoned_cart,
          upsell: order.checkout?.upsell,
          downsell: order.checkout?.downsell,
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
      const orders = await this.fetchOrders();
      for (const order of orders) {
        await this.saveTransaction(order);
      }
    } catch (error) {
      console.error('Erro ao sincronizar transações do Kiwify:', error);
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
            'order.created',
            'order.approved',
            'order.cancelled',
            'order.refunded',
            'order.chargeback',
            'order.expired',
            'membership.activated',
            'membership.cancelled',
            'membership.expired',
            'course.access_granted',
            'course.access_revoked',
            'commission.paid',
            'commission.cancelled',
            'checkout.abandoned',
            'checkout.recovered',
            'upsell.accepted',
            'upsell.declined',
            'downsell.accepted',
            'downsell.declined',
          ],
          active: true,
          description: 'Webhook para integração com sistema de gestão',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao criar webhook no Kiwify:', error);
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
      console.error('Erro ao processar webhook do Kiwify:', error);
      throw error;
    }
  }
} 