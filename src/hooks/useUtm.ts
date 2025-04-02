import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Utm } from '../types/supabase';
import { useLoading } from './useLoading';
import { useNotification } from './useNotification';
import { utmService } from '../services/utm';

export function useUtm(campaignId?: string) {
  const [utms, setUtms] = useState<Utm[]>([]);
  const [selectedUtm, setSelectedUtm] = useState<Utm | null>(null);
  const notification = useNotification();

  const [isLoading, setIsLoading] = useState(true);

  const loadUtmsCallback = useCallback(async () => {
    try {
      setIsLoading(true);
      const query = supabase
        .from('utms')
        .select('*, campaigns(name)');

      if (campaignId) {
        query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setUtms(data.map(utm => ({
        ...utm,
        campaign_name: utm.campaigns?.name
      })));
    } catch (error) {
      console.error('Error loading UTMs:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  const createUtmCallback = useCallback(async (data: Omit<Utm, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await utmService.createUtm(data);
      await loadUtmsCallback();
      notification.success('UTM criado com sucesso!');
      return result;
    } catch (error) {
      console.error('Error creating UTM:', error);
      throw error;
    }
  }, [loadUtmsCallback, notification]);

  const updateUtmCallback = useCallback(async (id: string, data: Partial<Utm>) => {
    try {
      const result = await utmService.updateUtm(id, data);
      await loadUtmsCallback();
      setSelectedUtm(result);
      notification.success('UTM atualizado com sucesso!');
      return result;
    } catch (error) {
      console.error('Error updating UTM:', error);
      throw error;
    }
  }, [loadUtmsCallback, notification]);

  const deleteUtmCallback = useCallback(async (id: string) => {
    try {
      const result = await utmService.deleteUtm(id);
      await loadUtmsCallback();
      setSelectedUtm(null);
      notification.success('UTM excluído com sucesso!');
      return result;
    } catch (error) {
      console.error('Error deleting UTM:', error);
      throw error;
    }
  }, [loadUtmsCallback, notification]);

  const [loadUtms, isLoadingUtms] = useLoading(loadUtmsCallback);
  const [createUtm, isCreating] = useLoading(createUtmCallback);
  const [updateUtm, isUpdating] = useLoading(updateUtmCallback);
  const [deleteUtm, isDeleting] = useLoading(deleteUtmCallback);

  const selectUtm = (id: string) => {
    setSelectedUtm(utms.find(utm => utm.id === id) || null);
  };

  const generateUrl = (utm: Utm) => {
    const params = new URLSearchParams();
    params.append('utm_source', utm.source);
    params.append('utm_medium', utm.medium);
    if (utm.term) params.append('utm_term', utm.term);
    if (utm.content) params.append('utm_content', utm.content);
    params.append('utm_campaign', utm.campaigns?.name || '');

    return `${utm.base_url}${utm.base_url.includes('?') ? '&' : '?'}${params.toString()}`;
  };

  return {
    utms,
    selectedUtm,
    isLoading,
    isLoadingUtms,
    isCreating,
    isUpdating,
    isDeleting,
    loadUtms,
    createUtm,
    updateUtm,
    deleteUtm,
    selectUtm,
    generateUrl,
  };
} 