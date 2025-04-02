import { supabase } from '../config/supabase';
import type { User } from '../config/supabase';

export const userService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, profile: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAccount(userId: string) {
    // Primeiro, remove todos os dados relacionados
    const tables = [
      'analytics',
      'campaigns',
      'payment_platforms',
      'utms',
      'users',
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    }

    // Por fim, remove a conta do usuário
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  },

  async getPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = Not Found
      throw error;
    }

    return data ?? {
      theme: 'light',
      notifications: true,
      emailUpdates: true,
    };
  },

  async updatePreferences(userId: string, preferences: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    emailUpdates?: boolean;
  }) {
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('user_preferences')
        .update(preferences)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('user_preferences')
        .insert([{ user_id: userId, ...preferences }]);

      if (error) throw error;
    }
  },

  async searchUsers(query: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data;
  },

  async list(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      throw error;
    }
  },
}; 