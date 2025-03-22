import { useQuery as useReactQuery, useMutation as useReactMutation } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { User, Profile, Dashboard, IntegrationSetting, UTM } from '../types';

export function useProfile(userId: string) {
  return useReactQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as Profile;
    }
  });
}

export function useDashboards(userId: string) {
  return useReactQuery({
    queryKey: ['dashboards', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Dashboard[];
    }
  });
}

export function useIntegrationSettings(userId: string) {
  return useReactQuery({
    queryKey: ['integration_settings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('created_by', userId);

      if (error) throw error;
      return data as IntegrationSetting[];
    }
  });
}

export function useUTMs(userId: string) {
  return useReactQuery({
    queryKey: ['utms', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('utms')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UTM[];
    }
  });
}

export function useCreateDashboard() {
  return useReactMutation({
    mutationFn: async (dashboard: Partial<Dashboard>) => {
      const { data, error } = await supabase
        .from('dashboards')
        .insert([dashboard])
        .select()
        .single();

      if (error) throw error;
      return data as Dashboard;
    }
  });
}

export function useUpdateDashboard() {
  return useReactMutation({
    mutationFn: async ({ id, ...updates }: Partial<Dashboard> & { id: string }) => {
      const { data, error } = await supabase
        .from('dashboards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Dashboard;
    }
  });
}

export function useDeleteDashboard() {
  return useReactMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    }
  });
}