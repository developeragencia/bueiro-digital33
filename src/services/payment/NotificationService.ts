import { supabase } from '../../lib/supabase';
import { paymentLogger } from './LogService';

export type NotificationType = 
  | 'payment.success'
  | 'payment.failed'
  | 'payment.refunded'
  | 'payment.chargeback'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'platform.error'
  | 'platform.status'
  | 'webhook.error';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'slack' | 'discord';

export interface NotificationTemplate {
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  body: string;
  variables: string[];
}

export interface Notification {
  id?: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  metadata?: Record<string, any>;
  platform_id?: string;
  transaction_id?: string;
  user_id?: string;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  created_at?: string;
  sent_at?: string;
}

export class PaymentNotificationService {
  private readonly table = 'payment_notifications';
  private readonly templatesTable = 'notification_templates';

  async sendNotification(
    type: NotificationType,
    recipient: string,
    data: Record<string, any>,
    metadata: {
      platform_id?: string;
      transaction_id?: string;
      user_id?: string;
      channel?: NotificationChannel;
    } = {}
  ): Promise<void> {
    try {
      const template = await this.getTemplate(type, metadata.channel || 'email');
      if (!template) {
        throw new Error(`Template not found for type: ${type} and channel: ${metadata.channel || 'email'}`);
      }

      const notification: Omit<Notification, 'id' | 'created_at'> = {
        type,
        channel: template.channel,
        recipient,
        subject: this.replaceVariables(template.subject, data),
        body: this.replaceVariables(template.body, data),
        metadata: data,
        platform_id: metadata.platform_id,
        transaction_id: metadata.transaction_id,
        user_id: metadata.user_id,
        status: 'pending'
      };

      await this.saveNotification(notification);
      await this.processNotification(notification);

    } catch (error) {
      paymentLogger.error(
        'Failed to send notification',
        error,
        { type, recipient, data },
        metadata
      );
      throw error;
    }
  }

  private async getTemplate(type: NotificationType, channel: NotificationChannel): Promise<NotificationTemplate | null> {
    const { data, error } = await supabase
      .from(this.templatesTable)
      .select('*')
      .eq('type', type)
      .eq('channel', channel)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  private replaceVariables(text: string, data: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private async saveNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .insert([notification]);

    if (error) {
      throw error;
    }
  }

  private async processNotification(notification: Notification): Promise<void> {
    try {
      switch (notification.channel) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSMS(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'slack':
          await this.sendSlackNotification(notification);
          break;
        case 'discord':
          await this.sendDiscordNotification(notification);
          break;
        default:
          throw new Error(`Unsupported notification channel: ${notification.channel}`);
      }

      await this.updateNotificationStatus(notification, 'sent');

    } catch (error) {
      await this.updateNotificationStatus(notification, 'failed', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    // Implementar integração com serviço de email (ex: SendGrid, AWS SES, etc)
    console.log('Sending email notification:', notification);
  }

  private async sendSMS(notification: Notification): Promise<void> {
    // Implementar integração com serviço de SMS (ex: Twilio, AWS SNS, etc)
    console.log('Sending SMS notification:', notification);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Implementar integração com serviço de push notifications (ex: Firebase Cloud Messaging, etc)
    console.log('Sending push notification:', notification);
  }

  private async sendSlackNotification(notification: Notification): Promise<void> {
    // Implementar integração com Slack
    console.log('Sending Slack notification:', notification);
  }

  private async sendDiscordNotification(notification: Notification): Promise<void> {
    // Implementar integração com Discord
    console.log('Sending Discord notification:', notification);
  }

  private async updateNotificationStatus(
    notification: Notification,
    status: 'sent' | 'failed',
    error?: string
  ): Promise<void> {
    const { error: updateError } = await supabase
      .from(this.table)
      .update({
        status,
        error,
        sent_at: status === 'sent' ? new Date().toISOString() : null
      })
      .eq('id', notification.id);

    if (updateError) {
      throw updateError;
    }
  }

  async getNotificationsByType(type: NotificationType, limit: number = 100): Promise<Notification[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }

  async getNotificationsByUser(userId: string, limit: number = 100): Promise<Notification[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }

  async getFailedNotifications(limit: number = 100): Promise<Notification[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('status', 'failed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }

  async retryFailedNotification(notificationId: string): Promise<void> {
    const { data: notification, error: fetchError } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', notificationId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.processNotification(notification);
  }

  async createTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<void> {
    const { error } = await supabase
      .from(this.templatesTable)
      .insert([template]);

    if (error) {
      throw error;
    }
  }

  async updateTemplate(
    type: NotificationType,
    channel: NotificationChannel,
    updates: Partial<NotificationTemplate>
  ): Promise<void> {
    const { error } = await supabase
      .from(this.templatesTable)
      .update(updates)
      .eq('type', type)
      .eq('channel', channel);

    if (error) {
      throw error;
    }
  }

  async deleteTemplate(type: NotificationType, channel: NotificationChannel): Promise<void> {
    const { error } = await supabase
      .from(this.templatesTable)
      .delete()
      .eq('type', type)
      .eq('channel', channel);

    if (error) {
      throw error;
    }
  }

  async cleanupOldNotifications(days: number = 30): Promise<void> {
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

export const paymentNotifier = new PaymentNotificationService(); 