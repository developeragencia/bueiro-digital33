import { Transaction } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';

export class ShopifyService extends BasePlatformService {
  private readonly SANDBOX_API_URL = 'https://sandbox.api.shopify.com/admin/api/2024-01';
  private readonly PRODUCTION_API_URL = 'https://api.shopify.com/admin/api/2024-01';

  constructor(platformId: string, apiKey: string, secretKey?: string, sandbox: boolean = true) {
    super(platformId, apiKey, secretKey, sandbox);
  }

  protected getSandboxApiUrl(): string {
    return this.SANDBOX_API_URL;
  }

  protected getProductionApiUrl(): string {
    return this.PRODUCTION_API_URL;
  }

  protected getHeaders(): Record<string, string> {
    return {
      ...super.getHeaders(),
      'X-Shopify-Access-Token': this.apiKey,
      'X-Shopify-Shop-Domain': this.secretKey || ''
    };
  }

  async processPayment(amount: number, currency: string, customer: Transaction['customer'], metadata?: Record<string, any>): Promise<Transaction> {
    this.validateApiKey();

    try {
      const response = await fetch(`${this.getApiUrl()}/orders.json`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          order: {
            line_items: [
              {
                title: metadata?.productName || 'Product',
                price: amount,
                quantity: metadata?.quantity || 1,
                sku: metadata?.productId
              }
            ],
            customer: {
              first_name: customer.name.split(' ')[0],
              last_name: customer.name.split(' ').slice(1).join(' '),
              email: customer.email,
              phone: customer.phone
            },
            financial_status: 'pending',
            currency,
            total_price: amount,
            billing_address: metadata?.billingAddress,
            shipping_address: metadata?.shippingAddress,
            note: metadata?.note,
            tags: metadata?.tags,
            ...metadata
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const order = data.order;

      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        platform_id: this.platformId,
        order_id: order.id.toString(),
        amount,
        currency,
        status: this.mapStatus(order.financial_status),
        customer,
        payment_method: order.payment_gateway_names?.[0] || 'unknown',
        metadata: {
          ...metadata,
          shopify_id: order.id,
          order_number: order.order_number,
          order_status_url: order.order_status_url,
          fulfillment_status: order.fulfillment_status,
          tags: order.tags,
          note: order.note,
          shipping_lines: order.shipping_lines,
          tax_lines: order.tax_lines,
          discount_codes: order.discount_codes,
          customer_id: order.customer?.id,
          location_id: order.location_id,
          source_name: order.source_name,
          total_discounts: order.total_discounts,
          total_tax: order.total_tax,
          total_shipping: order.total_shipping_price_set?.shop_money?.amount
        }
      };

      return this.saveTransaction(transaction);
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  async processRefund(transactionId: string, amount?: number): Promise<boolean> {
    this.validateApiKey();

    try {
      const response = await fetch(`${this.getApiUrl()}/orders/${transactionId}/refunds.json`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          refund: {
            notify: true,
            note: 'Refund processed via API',
            shipping: {
              full_refund: true
            },
            refund_line_items: amount ? [{
              line_item_id: transactionId,
              quantity: 1,
              amount: amount
            }] : undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.refund?.id) {
        await this.updateTransactionStatus(transactionId, 'refunded');
        return true;
      }

      return false;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  validateWebhook(payload: any, signature: string): boolean {
    this.validateSecretKey();
    const calculatedSignature = this.calculateSignature(payload);
    return calculatedSignature === signature;
  }

  private calculateSignature(payload: any): string {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return require('crypto')
      .createHmac('sha256', this.secretKey!)
      .update(data)
      .digest('base64');
  }

  private mapStatus(status: string): Transaction['status'] {
    const statusMap: Record<string, Transaction['status']> = {
      'paid': 'completed',
      'authorized': 'processing',
      'pending': 'pending',
      'partially_paid': 'processing',
      'refunded': 'refunded',
      'partially_refunded': 'refunded',
      'voided': 'cancelled',
      'expired': 'failed',
      'failure': 'failed'
    };

    return statusMap[status?.toLowerCase()] || 'pending';
  }
} 