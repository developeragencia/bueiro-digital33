import { supabase } from '../config/supabase';
import type { Campaign } from '../config/supabase';

export const campaignService = {
  async create(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([campaign])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, campaign: Partial<Campaign>) {
    const { data, error } = await supabase
      .from('campaigns')
      .update(campaign)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async list(filters?: {
    source?: string;
    medium?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let query = supabase.from('campaigns').select('*');

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    if (filters?.medium) {
      query = query.eq('medium', filters.medium);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },
}; 