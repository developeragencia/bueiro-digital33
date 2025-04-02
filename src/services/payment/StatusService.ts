import { supabase } from '../../lib/supabase';
import { PlatformStatus } from '../../types/payment';

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
  async createStatus(status: Omit<StatusData, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('platform_status')
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
        .from('platform_status')
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

  async getStatus(platformId: string): Promise<PlatformStatus> {
    try {
      const { data, error } = await supabase
        .from('platform_status')
        .select('*')
        .eq('platform_id', platformId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        isActive: data.is_active,
        lastChecked: new Date(data.last_checked),
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
        .from('platform_status')
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

  async checkPlatformStatus(platformId: string): Promise<PlatformStatus> {
    try {
      const startTime = Date.now();
      let isActive = true;
      let errors = 0;

      // Get the platform configuration
      const { data: platform, error: platformError } = await supabase
        .from('payment_platforms')
        .select('*')
        .eq('id', platformId)
        .single();

      if (platformError) {
        isActive = false;
        errors++;
      }

      // Check if we can connect to the platform's API
      if (platform?.api_key) {
        try {
          // Here you would implement the actual API health check
          // This is just a placeholder
          await this.mockApiHealthCheck();
        } catch (error) {
          isActive = false;
          errors++;
        }
      }

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Get the current status to calculate uptime
      const currentStatus = await this.getStatus(platformId).catch(() => null);
      const uptime = this.calculateUptime(currentStatus?.uptime ?? 100, isActive);

      const status: PlatformStatus = {
        isActive,
        lastChecked: new Date(),
        uptime,
        latency,
        errors
      };

      // Save the status check results
      await this.createStatus({
        platform_id: platformId,
        is_active: status.isActive,
        last_checked: status.lastChecked.toISOString(),
        uptime: status.uptime,
        latency: status.latency,
        errors: status.errors
      });

      return status;
    } catch (error) {
      console.error('Error checking platform status:', error);
      throw error;
    }
  }

  private calculateUptime(currentUptime: number, isActive: boolean): number {
    // Simple uptime calculation - could be made more sophisticated
    if (isActive) {
      return currentUptime;
    }

    // If platform is down, decrease uptime by 0.1%
    return Math.max(0, currentUptime - 0.1);
  }

  private async mockApiHealthCheck(): Promise<void> {
    // Simulate an API health check with random latency
    const latency = Math.random() * 1000; // Random latency between 0-1000ms
    await new Promise(resolve => setTimeout(resolve, latency));

    // Simulate occasional failures
    if (Math.random() < 0.1) { // 10% chance of failure
      throw new Error('API health check failed');
    }
  }

  async deleteOldStatus(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { error } = await supabase
        .from('platform_status')
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