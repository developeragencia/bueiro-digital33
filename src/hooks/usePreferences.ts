import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Preferences {
  id?: string;
  user_id?: string;
  theme?: string;
  notifications?: boolean;
  email_updates?: boolean;
  created_at?: string;
  updated_at?: string;
}

export function usePreferences(userId: string) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (data: Partial<Preferences>) => {
    try {
      const { error } = await supabase
        .from('preferences')
        .upsert({
          user_id: userId,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setPreferences(prev => prev ? { ...prev, ...data } : data);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const updateTheme = async (theme: string) => {
    return update({ theme });
  };

  const updateNotifications = async (notifications: {
    app: boolean;
    email: boolean;
  }) => {
    return update({
      notifications: notifications.app,
      email_updates: notifications.email
    });
  };

  return {
    preferences,
    isLoading,
    updateTheme,
    updateNotifications
  };
} 