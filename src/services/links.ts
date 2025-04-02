import { supabase } from '../lib/supabase';
import { Link } from '../types/supabase';

export const linkService = {
  async getLinks() {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*, campaign:campaigns(*)');

      if (error) throw error;

      return data;
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