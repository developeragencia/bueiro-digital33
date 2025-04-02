import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Utm = Database['public']['Tables']['utms']['Row'];
type UtmInsert = Database['public']['Tables']['utms']['Insert'];
type UtmUpdate = Database['public']['Tables']['utms']['Update'];

export class UtmService {
  static async list(userId: string): Promise<Utm[]> {
    const { data, error } = await supabase
      .from('utms')
      .select('*, campaigns(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async get(id: string, userId: string): Promise<Utm> {
    const { data, error } = await supabase
      .from('utms')
      .select('*, campaigns(name)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async create(utm: UtmInsert): Promise<Utm> {
    const { data, error } = await supabase
      .from('utms')
      .insert([utm])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async update(id: string, utm: UtmUpdate): Promise<Utm> {
    const { data, error } = await supabase
      .from('utms')
      .update(utm)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('utms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  static generateUtmUrl(utm: Utm): string {
    const params = new URLSearchParams();
    params.append('utm_source', utm.source);
    params.append('utm_medium', utm.medium);
    if (utm.term) params.append('utm_term', utm.term);
    if (utm.content) params.append('utm_content', utm.content);
    params.append('utm_campaign', utm.name);

    return `${utm.base_url}${utm.base_url.includes('?') ? '&' : '?'}${params.toString()}`;
  }
} 