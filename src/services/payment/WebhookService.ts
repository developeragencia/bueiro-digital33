import { supabase } from '../../lib/supabase';
import { WebhookConfig } from '../../types/payment';

interface WebhookEvent {
  id: string;
  created_at: string;
  platform_id: string;
  event_type: string;
  event_data: any;
  status: 'pending' | 'processed' | 'failed';
  attempts: number;
  last_attempt: string | null;
  error: string | null;
}

class WebhookService {
  async createEvent(event: Omit<WebhookEvent, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .insert([event])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating webhook event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, event: Partial<WebhookEvent>) {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .update(event)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating webhook event:', error);
      throw error;
    }
  }

  async getEvent(id: string) {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting webhook event:', error);
      throw error;
    }
  }

  async getEventsByPlatform(platformId: string) {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('platform_id', platformId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting platform webhook events:', error);
      throw error;
    }
  }

  async getPendingEvents() {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting pending webhook events:', error);
      throw error;
    }
  }

  async getFailedEvents() {
    try {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .eq('status', 'failed')
        .order('last_attempt', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting failed webhook events:', error);
      throw error;
    }
  }

  async retryFailedEvent(id: string) {
    try {
      const event = await this.getEvent(id);
      if (!event) throw new Error('Event not found');

      // Increment attempts and update last attempt
      await this.updateEvent(id, {
        status: 'pending',
        attempts: event.attempts + 1,
        last_attempt: new Date().toISOString(),
        error: null
      });

      return await this.getEvent(id);
    } catch (error) {
      console.error('Error retrying failed webhook event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string) {
    try {
      const { error } = await supabase
        .from('webhook_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting webhook event:', error);
      throw error;
    }
  }

  async cleanupOldEvents(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('webhook_events')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up old webhook events:', error);
      throw error;
    }
  }

  validateWebhookConfig(config: WebhookConfig): boolean {
    if (!config.url || !this.isValidUrl(config.url)) {
      return false;
    }

    if (config.secret && config.secret.length < 32) {
      return false;
    }

    if (config.events && !Array.isArray(config.events)) {
      return false;
    }

    return true;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const webhookService = new WebhookService(); 