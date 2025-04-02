import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Preferences = Database['public']['Tables']['user_preferences']['Row'];
type PreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

export class PreferencesService {
  static async get(userId: string): Promise<Preferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!data) {
        // Se não existir preferências, cria com valores padrão
        const defaultPreferences = {
          user_id: userId,
          theme: 'system',
          language: 'pt-BR',
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_preferences')
          .insert([defaultPreferences])
          .select()
          .single();

        if (insertError) throw insertError;
        return newData;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      throw error;
    }
  }

  static async update(id: string, data: PreferencesUpdate): Promise<Preferences> {
    try {
      const { data: updatedData, error } = await supabase
        .from('user_preferences')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      throw error;
    }
  }
} 