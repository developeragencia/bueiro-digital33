import { PaymentPlatform, Transaction } from '../../types/payment';
import { supabase } from '../../lib/supabase';
import { getPlatformService } from './platforms';

export class WebhookService {
  private readonly table = 'webhooks';

  async handleWebhook(platformId: string, payload: any, signature: string): Promise<void> {
    try {
      const platform = await this.getPlatform(platformId);
      if (!platform) {
        throw new Error('Platform not found');
      }

      const service = getPlatformService(platform.type, {
        apiKey: platform.settings.apiKey,
        secretKey: platform.settings.secretKey,
        sandbox: platform.settings.sandbox || false
      });

      const isValid = service.validateWebhook(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      await this.saveWebhook({
        platform_id: platformId,
        event: payload.event,
        payload,
        status: 'received'
      });

      await this.processWebhook(platform, payload);
    } catch (error) {
      console.error('Error handling webhook:', error);
      await this.saveWebhook({
        platform_id: platformId,
        event: payload?.event,
        payload,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async getPlatform(platformId: string): Promise<PaymentPlatform | null> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .select('*')
      .eq('id', platformId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  private async saveWebhook(data: {
    platform_id: string;
    event: string;
    payload: any;
    status: 'received' | 'processed' | 'failed';
    error?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .insert([data]);

    if (error) {
      throw error;
    }
  }

  private async processWebhook(platform: PaymentPlatform, payload: any): Promise<void> {
    try {
      switch (payload.event) {
        case 'payment.created':
        case 'payment.approved':
        case 'payment.pending':
        case 'payment.failed':
        case 'payment.refunded':
        case 'payment.chargeback':
          await this.processPaymentWebhook(platform, payload);
          break;
        case 'subscription.created':
        case 'subscription.activated':
        case 'subscription.cancelled':
        case 'subscription.expired':
          await this.processSubscriptionWebhook(platform, payload);
          break;
        case 'customer.created':
        case 'customer.updated':
        case 'customer.deleted':
          await this.processCustomerWebhook(platform, payload);
          break;
        default:
          console.warn(`Unhandled webhook event: ${payload.event}`);
      }

      await this.saveWebhook({
        platform_id: platform.id,
        event: payload.event,
        payload,
        status: 'processed'
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      await this.saveWebhook({
        platform_id: platform.id,
        event: payload.event,
        payload,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async processPaymentWebhook(platform: PaymentPlatform, payload: any): Promise<void> {
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('platform_id', platform.id)
      .eq('order_id', payload.data.order_id)
      .single();

    if (error) {
      throw error;
    }

    if (!transaction) {
      const service = getPlatformService(platform.type, {
        apiKey: platform.settings.apiKey,
        secretKey: platform.settings.secretKey,
        sandbox: platform.settings.sandbox || false
      });

      const newTransaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        platform_id: platform.id,
        order_id: payload.data.order_id,
        amount: payload.data.amount,
        currency: payload.data.currency,
        status: this.mapWebhookStatus(payload.event),
        customer: {
          name: payload.data.customer.name,
          email: payload.data.customer.email,
          phone: payload.data.customer.phone,
          document: payload.data.customer.document
        },
        payment_method: payload.data.payment_method,
        metadata: payload.data
      };

      await service.saveTransaction(newTransaction);
    } else {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: this.mapWebhookStatus(payload.event),
          metadata: { ...transaction.metadata, ...payload.data }
        })
        .eq('id', transaction.id);

      if (updateError) {
        throw updateError;
      }
    }
  }

  private async processSubscriptionWebhook(platform: PaymentPlatform, payload: any): Promise<void> {
    // Implement subscription webhook processing logic
    console.log('Processing subscription webhook:', payload);
  }

  private async processCustomerWebhook(platform: PaymentPlatform, payload: any): Promise<void> {
    // Implement customer webhook processing logic
    console.log('Processing customer webhook:', payload);
  }

  private mapWebhookStatus(event: string): Transaction['status'] {
    switch (event) {
      case 'payment.approved':
        return 'completed';
      case 'payment.pending':
        return 'pending';
      case 'payment.failed':
        return 'failed';
      case 'payment.refunded':
        return 'refunded';
      case 'payment.chargeback':
        return 'failed';
      default:
        return 'pending';
    }
  }

  async getWebhooksByPlatformId(platformId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('platform_id', platformId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  async getWebhooksByStatus(status: 'received' | 'processed' | 'failed'): Promise<any[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  async getFailedWebhooks(): Promise<any[]> {
    return this.getWebhooksByStatus('failed');
  }

  async retryFailedWebhook(webhookId: string): Promise<void> {
    const { data: webhook, error: fetchError } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', webhookId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const platform = await this.getPlatform(webhook.platform_id);
    if (!platform) {
      throw new Error('Platform not found');
    }

    await this.processWebhook(platform, webhook.payload);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', webhookId);

    if (error) {
      throw error;
    }
  }

  async cleanupOldWebhooks(days: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { error } = await supabase
      .from(this.table)
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw error;
    }
  }
}