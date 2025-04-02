import { supabase } from '../lib/supabase';
import { Link } from '../types/links';

export const linkService = {
  async getLinks(): Promise<Link[]> {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mapear os dados para garantir que todos os campos necessários estejam presentes
      const links: Link[] = data.map(link => ({
        id: link.id,
        original_url: link.original_url,
        short_url: link.short_url,
        clicks: link.clicks || 0,
        user_id: link.user_id,
        created_at: link.created_at,
        updated_at: link.updated_at
      }));

      return links;
    } catch (error) {
      console.error('Error getting links:', error);
      throw error;
    }
  },

  async create(link: Omit<Link, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('links')
        .insert(link)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  },

  async update(id: string, link: Partial<Link>) {
    try {
      const { data, error } = await supabase
        .from('links')
        .update(link)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  }
}; 