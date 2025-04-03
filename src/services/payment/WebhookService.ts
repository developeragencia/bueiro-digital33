import { PaymentPlatform, Transaction } from '../../types/payment';
import { supabase } from '../../lib/supabase';
import { PaymentPlatformService } from './PaymentPlatformService';
import { TransactionService } from './TransactionService';

interface WebhookError extends Error {
  code?: string;
  details?: string;
}

interface Webhook {
  id: string;
  platform_id: string;
  event: string;
  payload: Record<string, any>;
  status: WebhookStatus;
  error?: string;
  created_at: Date;
  updated_at: Date;
}

type WebhookStatus = 'received' | 'processed' | 'failed';
type WebhookEventType = 'payment' | 'subscription' | 'customer' | 'unknown';

export class WebhookService {
  private readonly table = 'webhooks';

  constructor(
    private readonly platformService: PaymentPlatformService,
    private readonly transactionService: TransactionService
  ) {}

  async handleWebhook(platformId: string, payload: Record<string, any>, signature: string): Promise<void> {
    try {
      const platform = await this.getPlatform(platformId);
      if (!platform) {
        throw this.createError('Platform not found', 'PLATFORM_NOT_FOUND');
      }

      const isValid = await this.validateWebhook(platform, payload, signature);
      if (!isValid) {
        throw this.createError('Invalid webhook signature', 'INVALID_SIGNATURE');
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
      throw this.createError(
        `Failed to handle webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'WEBHOOK_HANDLING_ERROR'
      );
    }
  }

  private async getPlatform(platformId: string): Promise<PaymentPlatform | null> {
    try {
      const { data, error } = await supabase
        .from('payment_platforms')
        .select('*')
        .eq('id', platformId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting platform:', error);
      throw this.createError('Failed to get platform', 'PLATFORM_FETCH_ERROR');
    }
  }

  private async saveWebhook(data: Omit<Webhook, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .insert([{
          ...data,
          created_at: new Date(),
          updated_at: new Date()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving webhook:', error);
      throw this.createError('Failed to save webhook', 'WEBHOOK_SAVE_ERROR');
    }
  }

  async validateWebhook(platform: PaymentPlatform, payload: Record<string, any>, signature: string): Promise<boolean> {
    try {
      return await this.platformService.validateWebhook(platform, payload, signature);
    } catch (error) {
      console.error('Error validating webhook:', error);
      throw this.createError('Failed to validate webhook', 'WEBHOOK_VALIDATION_ERROR');
    }
  }

  async processWebhook(platform: PaymentPlatform, payload: Record<string, any>): Promise<void> {
    try {
      const eventType = this.getEventType(payload);
      
      switch (eventType) {
        case 'payment':
          await this.processPaymentWebhook(platform, payload);
          break;
        case 'subscription':
          await this.processSubscriptionWebhook(platform, payload);
          break;
        case 'customer':
          await this.processCustomerWebhook(platform, payload);
          break;
        default:
          console.warn(`Unhandled webhook event type: ${eventType}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw this.createError('Failed to process webhook', 'WEBHOOK_PROCESSING_ERROR');
    }
  }

  private getEventType(payload: Record<string, any>): WebhookEventType {
    const event = payload.event?.toLowerCase() || '';
    
    if (event.includes('payment') || event.includes('transaction')) {
      return 'payment';
    }
    if (event.includes('subscription')) {
      return 'subscription';
    }
    if (event.includes('customer')) {
      return 'customer';
    }
    
    return 'unknown';
  }

  private async processPaymentWebhook(platform: PaymentPlatform, payload: Record<string, any>): Promise<void> {
    try {
      const transaction = await this.platformService.processPayment(platform, payload);
      await this.transactionService.create(transaction);
      console.log('Payment webhook processed successfully');
    } catch (error) {
      console.error('Error processing payment webhook:', error);
      throw this.createError('Failed to process payment webhook', 'PAYMENT_WEBHOOK_ERROR');
    }
  }

  private async processSubscriptionWebhook(platform: PaymentPlatform, payload: Record<string, any>): Promise<void> {
    console.log('Processing subscription webhook:', platform.id, payload);
    // Implementar lógica para processar webhooks de assinatura
  }

  private async processCustomerWebhook(platform: PaymentPlatform, payload: Record<string, any>): Promise<void> {
    console.log('Processing customer webhook:', platform.id, payload);
    // Implementar lógica para processar webhooks de cliente
  }

  async getWebhooksByPlatformId(platformId: string): Promise<Webhook[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('platform_id', platformId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting webhooks by platform ID:', error);
      throw this.createError('Failed to get webhooks by platform ID', 'WEBHOOK_FETCH_ERROR');
    }
  }

  async getWebhooksByStatus(status: WebhookStatus): Promise<Webhook[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting webhooks by status:', error);
      throw this.createError('Failed to get webhooks by status', 'WEBHOOK_STATUS_FETCH_ERROR');
    }
  }

  async getFailedWebhooks(): Promise<Webhook[]> {
    return this.getWebhooksByStatus('failed');
  }

  async retryFailedWebhook(webhookId: string): Promise<void> {
    try {
      const { data: webhook, error: fetchError } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', webhookId)
        .single();

      if (fetchError) throw fetchError;
      if (!webhook) throw this.createError('Webhook not found', 'WEBHOOK_NOT_FOUND');

      const platform = await this.getPlatform(webhook.platform_id);
      if (!platform) throw this.createError('Platform not found', 'PLATFORM_NOT_FOUND');

      await this.processWebhook(platform, webhook.payload);
      await this.updateWebhookStatus(webhookId, 'processed');
    } catch (error) {
      console.error('Error retrying failed webhook:', error);
      throw this.createError('Failed to retry webhook', 'WEBHOOK_RETRY_ERROR');
    }
  }

  private async updateWebhookStatus(webhookId: string, status: WebhookStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .update({ 
          status,
          updated_at: new Date()
        })
        .eq('id', webhookId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating webhook status:', error);
      throw this.createError('Failed to update webhook status', 'WEBHOOK_STATUS_UPDATE_ERROR');
    }
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', webhookId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw this.createError('Failed to delete webhook', 'WEBHOOK_DELETE_ERROR');
    }
  }

  async cleanupOldWebhooks(days: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { error } = await supabase
        .from(this.table)
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up old webhooks:', error);
      throw this.createError('Failed to cleanup old webhooks', 'WEBHOOK_CLEANUP_ERROR');
    }
  }

  private createError(message: string, code: string): WebhookError {
    const error = new Error(message) as WebhookError;
    error.code = code;
    return error;
  }
}