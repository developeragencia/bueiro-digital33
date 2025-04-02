import { supabase } from '../../lib/supabase';
import { PlatformStatusData } from '../../types/payment';

export class StatusServiceClass {
  private table = 'platform_status';

  async create(data: Omit<PlatformStatusData, 'id' | 'created_at' | 'updated_at'>): Promise<PlatformStatusData> {
    const { data: status, error } = await supabase
      .from(this.table)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return status;
  }

  async update(id: string, data: Partial<PlatformStatusData>): Promise<PlatformStatusData> {
    const { data: status, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return status;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getById(id: string): Promise<PlatformStatusData> {
    const { data: status, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return status;
  }

  async getByPlatformId(platformId: string): Promise<PlatformStatusData> {
    const { data: status, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('platform_id', platformId)
      .single();

    if (error) throw error;
    return status;
  }

  async updateStatus(platformId: string, isActive: boolean): Promise<PlatformStatusData> {
    const status = await this.getByPlatformId(platformId);
    return this.update(status.id, { is_active: isActive });
  }

  async checkHealth(platformId: string): Promise<PlatformStatusData> {
    const startTime = Date.now();
    let errors = 0;
    let isActive = true;

    try {
      const { error } = await supabase
        .from('payment_platforms')
        .select('id')
        .eq('id', platformId)
        .single();

      if (error) {
        errors++;
        isActive = false;
      }
    } catch (error) {
      errors++;
      isActive = false;
    }

    const endTime = Date.now();
    const latency = endTime - startTime;

    const status: Omit<PlatformStatusData, 'id' | 'created_at' | 'updated_at'> = {
      is_active: isActive,
      last_checked: new Date().toISOString(),
      uptime: isActive ? 100 : 0,
      latency,
      errors
    };

    const existingStatus = await this.getByPlatformId(platformId).catch(() => null);
    if (existingStatus) {
      return this.update(existingStatus.id, status);
    }

    return this.create(status);
  }

  async monitorPlatform(platformId: string): Promise<void> {
    await this.checkHealth(platformId);
  }
}

export const StatusService = new StatusServiceClass(); 