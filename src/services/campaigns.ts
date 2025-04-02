import { supabase } from '../lib/supabase';
import { Campaign } from '../types/supabase';

export const campaignService = {
  async getCampaigns() {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw error;
    }
  },

  async create(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  async update(id: string, campaign: Partial<Campaign>) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update(campaign)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
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