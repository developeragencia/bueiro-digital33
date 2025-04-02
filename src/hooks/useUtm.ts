import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Utm } from '../types/supabase';
import { useLoading } from './useLoading';
import { useNotification } from './useNotification';

export function useUtm(campaignId?: string) {
  const [utms, setUtms] = useState<Utm[]>([]);
  const [selectedUtm, setSelectedUtm] = useState<Utm | null>(null);
  const notification = useNotification();

  const [isLoading, setIsLoading] = useState(true);

  const [loadUtms, isLoadingUtms] = useLoading(loadUtms);
  const [createUtm, isCreating] = useLoading(createUtm);
  const [updateUtm, isUpdating] = useLoading(updateUtm);
  const [deleteUtm, isDeleting] = useLoading(deleteUtm);

  useEffect(() => {
    if (campaignId) {
      loadUtms();
    }
  }, [campaignId]);

  const loadUtms = async () => {
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
  };

  const fetchUtm = async (id: string) => {
    const result = await loadUtms();
    setSelectedUtm(result.find(utm => utm.id === id) || null);
    return result;
  };

  const create = async (utm: Omit<Utm, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await createUtm(utm);
      setUtms(prev => [...prev, result]);
      notification.success('UTM criado com sucesso!');
      return result;
    } catch (error) {
      console.error('Error creating UTM:', error);
      throw error;
    }
  };

  const update = async (id: string, utm: Partial<Utm>) => {
    try {
      const result = await updateUtm(id, utm);
      setUtms(prev => prev.map(u => u.id === id ? result : u));
      setSelectedUtm(result);
      notification.success('UTM atualizado com sucesso!');
      return result;
    } catch (error) {
      console.error('Error updating UTM:', error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteUtm(id);
      setUtms(prev => prev.filter(u => u.id !== id));
      setSelectedUtm(null);
      notification.success('UTM excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting UTM:', error);
      throw error;
    }
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
    fetchUtm,
    create,
    update,
    remove,
    generateUrl,
  };
} 