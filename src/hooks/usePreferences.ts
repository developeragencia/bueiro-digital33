import { useState, useEffect } from 'react';
import { PreferencesService } from '../services/PreferencesService';
import { Database } from '../types/supabase';
import { useLoading } from './useLoading';
import { useNotification } from './useNotification';

type Preferences = Database['public']['Tables']['user_preferences']['Row'];
type PreferencesUpdate = Database['public']['Tables']['user_preferences']['Update'];

export function usePreferences(userId: string) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const notification = useNotification();

  const [loadPreferences, isLoading] = useLoading(PreferencesService.get);
  const [updatePreferences, isUpdating] = useLoading(PreferencesService.update);

  useEffect(() => {
    if (userId) {
      fetchPreferences();
    }
  }, [userId]);

  const fetchPreferences = async () => {
    const result = await loadPreferences(userId);
    setPreferences(result);
    return result;
  };

  const update = async (data: PreferencesUpdate) => {
    if (!preferences?.id) {
      notification.error('Preferências não encontradas');
      return;
    }

    const result = await updatePreferences(preferences.id, data);
    setPreferences(result);
    notification.success('Preferências atualizadas com sucesso!');
    return result;
  };

  const updateTheme = async (theme: 'light' | 'dark' | 'system') => {
    return update({ theme });
  };

  const updateLanguage = async (language: string) => {
    return update({ language });
  };

  const updateNotifications = async (notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  }) => {
    return update({
      email_notifications: notifications.email,
      push_notifications: notifications.push,
      sms_notifications: notifications.sms,
    });
  };

  const updateTimeZone = async (timezone: string) => {
    return update({ timezone });
  };

  return {
    preferences,
    isLoading,
    isUpdating,
    fetchPreferences,
    update,
    updateTheme,
    updateLanguage,
    updateNotifications,
    updateTimeZone,
  };
} 