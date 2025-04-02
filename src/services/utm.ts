import { supabase } from '../config/supabase';
import type { UTM } from '../config/supabase';

export const utmService = {
  async create(utm: Omit<UTM, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('utms')
      .insert([utm])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, utm: Partial<UTM>) {
    const { data, error } = await supabase
      .from('utms')
      .update(utm)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('utms')
      .delete()
      .eq('id', id);

    if (error) throw error;
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