import { PlatformStatusData, PlatformStatus, PaymentPlatform } from '../../types/payment';
import { supabase } from '../../lib/supabase';
import { PaymentPlatformService } from './PaymentPlatformService';

interface StatusServiceError extends Error {
  code?: string;
  details?: string;
}

export class StatusService {
  private readonly table = 'platform_status';
  private platformService: PaymentPlatformService;

  constructor() {
    this.platformService = new PaymentPlatformService();
  }

  async create(data: Omit<PlatformStatusData, 'id' | 'created_at' | 'updated_at'>): Promise<PlatformStatusData> {
    try {
      const { data: result, error } = await supabase
        .from(this.table)
        .insert({
          ...data,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single();

      if (error) throw this.createError(`Failed to create status: ${error.message}`, 'STATUS_CREATE_ERROR');
      return result;
    } catch (error) {
      console.error('Error creating status:', error);
      throw this.createError('Failed to create status', 'STATUS_CREATE_ERROR');
    }
  }

  async getById(id: string): Promise<PlatformStatusData | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select()
        .eq('id', id)
        .single();

      if (error) throw this.createError(`Failed to get status: ${error.message}`, 'STATUS_FETCH_ERROR');
      return data;
    } catch (error) {
      console.error('Error getting status:', error);
      throw this.createError('Failed to get status', 'STATUS_FETCH_ERROR');
    }
  }

  async update(id: string, updates: Partial<PlatformStatusData>): Promise<PlatformStatusData> {
    try {
      const { data: result, error } = await supabase
        .from(this.table)
        .update({
          ...updates,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw this.createError(`Failed to update status: ${error.message}`, 'STATUS_UPDATE_ERROR');
      return result;
    } catch (error) {
      console.error('Error updating status:', error);
      throw this.createError('Failed to update status', 'STATUS_UPDATE_ERROR');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id);

      if (error) throw this.createError(`Failed to delete status: ${error.message}`, 'STATUS_DELETE_ERROR');
    } catch (error) {
      console.error('Error deleting status:', error);
      throw this.createError('Failed to delete status', 'STATUS_DELETE_ERROR');
    }
  }

  async list(): Promise<PlatformStatusData[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select();

      if (error) throw this.createError(`Failed to list status: ${error.message}`, 'STATUS_LIST_ERROR');
      return data || [];
    } catch (error) {
      console.error('Error listing status:', error);
      throw this.createError('Failed to list status', 'STATUS_LIST_ERROR');
    }
  }

  async getStatus(platformId: string): Promise<PlatformStatusData | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('platform_id', platformId)
        .single();

      if (error) throw this.createError(`Failed to get platform status: ${error.message}`, 'PLATFORM_STATUS_FETCH_ERROR');
      return data;
    } catch (error) {
      console.error('Error getting platform status:', error);
      throw this.createError('Failed to get platform status', 'PLATFORM_STATUS_FETCH_ERROR');
    }
  }

  async getAllStatus(): Promise<Record<string, PlatformStatusData>> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*');

      if (error) throw this.createError(`Failed to get all platform status: ${error.message}`, 'PLATFORM_STATUS_FETCH_ERROR');

      const statusMap: Record<string, PlatformStatusData> = {};
      data?.forEach(status => {
        statusMap[status.platform_id] = status;
      });

      return statusMap;
    } catch (error) {
      console.error('Error getting all platform status:', error);
      throw this.createError('Failed to get all platform status', 'PLATFORM_STATUS_FETCH_ERROR');
    }
  }

  async updateStatus(platformId: string, status: Partial<PlatformStatusData>): Promise<void> {
    try {
      const now = new Date();
      const { error } = await supabase
        .from(this.table)
        .upsert({
          platform_id: platformId,
          ...status,
          last_check: now,
          created_at: status.created_at || now,
          updated_at: now
        });

      if (error) throw this.createError(`Failed to update platform status: ${error.message}`, 'PLATFORM_STATUS_UPDATE_ERROR');
    } catch (error) {
      console.error('Error updating platform status:', error);
      throw this.createError('Failed to update platform status', 'PLATFORM_STATUS_UPDATE_ERROR');
    }
  }

  async checkStatus(platform: PaymentPlatform): Promise<PlatformStatusData> {
    try {
      const status = await this.platformService.getStatus(platform);
      await this.updateStatus(platform.id, status);
      return status;
    } catch (error) {
      const now = new Date();
      const errorStatus: PlatformStatusData = {
        platform_id: platform.id,
        is_active: false,
        uptime: 0,
        error_rate: 1,
        last_check: now,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        created_at: now,
        updated_at: now
      };

      await this.updateStatus(platform.id, errorStatus);
      return errorStatus;
    }
  }

  async checkAllStatus(platforms: PaymentPlatform[]): Promise<Record<string, PlatformStatusData>> {
    const results: Record<string, PlatformStatusData> = {};

    for (const platform of platforms) {
      try {
        results[platform.id] = await this.checkStatus(platform);
      } catch (error) {
        console.error(`Error checking status for platform ${platform.id}:`, error);
        const now = new Date();
        results[platform.id] = {
          platform_id: platform.id,
          is_active: false,
          uptime: 0,
          error_rate: 1,
          last_check: now,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
          created_at: now,
          updated_at: now
        };
      }
    }

    return results;
  }

  async updateMetrics(platformId: string, metrics: Partial<PlatformStatusData>): Promise<void> {
    try {
      const now = new Date();
      const { error } = await supabase
        .from(this.table)
        .update({
          ...metrics,
          updated_at: now
        })
        .eq('platform_id', platformId);

      if (error) throw this.createError(`Failed to update platform metrics: ${error.message}`, 'PLATFORM_METRICS_UPDATE_ERROR');
    } catch (error) {
      console.error('Error updating platform metrics:', error);
      throw this.createError('Failed to update platform metrics', 'PLATFORM_METRICS_UPDATE_ERROR');
    }
  }

  async monitorPlatform(platformId: string): Promise<void> {
    try {
      const now = new Date();
      await this.updateMetrics(platformId, {
        platform_id: platformId,
        last_check: now,
        is_active: true,
        status: 'active',
        created_at: now,
        updated_at: now
      });
    } catch (error) {
      console.error('Error monitoring platform:', error);
      const now = new Date();
      await this.updateMetrics(platformId, {
        platform_id: platformId,
        last_check: now,
        is_active: false,
        error_rate: 1,
        status: 'error',
        created_at: now,
        updated_at: now
      });
    }
  }

  async checkHealth(platformId: string): Promise<boolean> {
    try {
      const status = await this.getStatus(platformId);
      if (!status) return false;
      return status.is_active && status.error_rate < 0.1;
    } catch (error) {
      console.error('Error checking platform health:', error);
      return false;
    }
  }

  private createError(message: string, code: string): StatusServiceError {
    const error = new Error(message) as StatusServiceError;
    error.code = code;
    return error;
  }
} 