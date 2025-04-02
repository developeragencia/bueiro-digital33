import { supabase } from '../../lib/supabase';
import { PlatformStatusData } from '../../types/payment';

interface StatusData {
  id: string;
  created_at: string;
  platform_id: string;
  is_active: boolean;
  last_checked: string;
  uptime: number;
  latency: number;
  errors: number;
  updated_at: string;
}

class StatusService {
  private table = 'platform_status';

  async createStatus(status: Omit<StatusData, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .insert([status])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating platform status:', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: Partial<StatusData>) {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .update(status)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating platform status:', error);
      throw error;
    }
  }

  async getStatus(platformId: string): Promise<PlatformStatusData> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('platform_id', platformId)
        .single();

      if (error) throw error;

      return {
        is_active: data.is_active,
        last_checked: data.last_checked,
        uptime: data.uptime,
        latency: data.latency,
        errors: data.errors
      };
    } catch (error) {
      console.error('Error getting platform status:', error);
      throw error;
    }
  }

  async getStatusHistory(platformId: string, days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('platform_id', platformId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting platform status history:', error);
      throw error;
    }
  }

  async checkPlatformStatus(platformId: string): Promise<PlatformStatusData> {
    try {
      const startTime = Date.now();
      const isActive = await this.checkApiHealth(platformId);
      const latency = Date.now() - startTime;

      const status: PlatformStatusData = {
        is_active: isActive,
        last_checked: new Date().toISOString(),
        uptime: isActive ? 100 : 0,
        latency,
        errors: isActive ? 0 : 1
      };

      await this.updateStatus(platformId, status);

      return status;
    } catch (error) {
      console.error('Error checking platform status:', error);
      throw error;
    }
  }

  private async checkApiHealth(platformId: string): Promise<boolean> {
    try {
      // Simula uma verificação de API com latência aleatória
      const latency = Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, latency));

      // Simula falhas ocasionais (10% de chance)
      return Math.random() > 0.1;
    } catch (error) {
      console.error('Error checking API health:', error);
      return false;
    }
  }

  async deleteOldStatus(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { error } = await supabase
        .from(this.table)
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting old status records:', error);
      throw error;
    }
  }
}

export const statusService = new StatusService(); 