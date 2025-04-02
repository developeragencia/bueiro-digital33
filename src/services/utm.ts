import { supabase } from '../lib/supabase';
import { Utm } from '../types/supabase';

export const utmService = {
  async getUtms() {
    try {
      const { data, error } = await supabase
        .from('utms')
        .select('*, campaigns(*)');

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error getting UTMs:', error);
      throw error;
    }
  },

  async create(utm: Omit<Utm, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('utms')
        .insert(utm)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating UTM:', error);
      throw error;
    }
  },

  async update(id: string, utm: Partial<Utm>) {
    try {
      const { data, error } = await supabase
        .from('utms')
        .update(utm)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating UTM:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('utms')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting UTM:', error);
      throw error;
    }
  },

  async getByCampaignId(campaignId: string) {
    const { data, error } = await supabase
      .from('utms')
      .select('*')
      .eq('campaign_id', campaignId);

    if (error) throw error;
    return data;
  },

  async generateUtmUrl(baseUrl: string, params: {
    source: string;
    medium: string;
    campaign: string;
    content?: string;
    term?: string;
  }) {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', params.source);
    url.searchParams.set('utm_medium', params.medium);
    url.searchParams.set('utm_campaign', params.campaign);
    
    if (params.content) {
      url.searchParams.set('utm_content', params.content);
    }
    
    if (params.term) {
      url.searchParams.set('utm_term', params.term);
    }

    return url.toString();
  },
}; 