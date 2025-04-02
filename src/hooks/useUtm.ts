import { useState } from 'react';
import { UtmService } from '../services/UtmService';
import { Database } from '../types/supabase';
import { useLoading } from './useLoading';
import { useNotification } from './useNotification';

type Utm = Database['public']['Tables']['utms']['Row'];
type UtmInsert = Database['public']['Tables']['utms']['Insert'];
type UtmUpdate = Database['public']['Tables']['utms']['Update'];

export function useUtm(userId: string) {
  const [utms, setUtms] = useState<Utm[]>([]);
  const [selectedUtm, setSelectedUtm] = useState<Utm | null>(null);
  const notification = useNotification();

  const [loadUtms, isLoadingUtms] = useLoading(UtmService.list);
  const [loadUtm, isLoadingUtm] = useLoading(UtmService.get);
  const [createUtm, isCreating] = useLoading(UtmService.create);
  const [updateUtm, isUpdating] = useLoading(UtmService.update);
  const [deleteUtm, isDeleting] = useLoading(UtmService.delete);

  const fetchUtms = async () => {
    const result = await loadUtms(userId);
    setUtms(result);
    return result;
  };

  const fetchUtm = async (id: string) => {
    const result = await loadUtm(id, userId);
    setSelectedUtm(result);
    return result;
  };

  const create = async (utm: UtmInsert) => {
    const result = await createUtm(utm);
    setUtms((prev) => [result, ...prev]);
    notification.success('UTM criado com sucesso!');
    return result;
  };

  const update = async (id: string, utm: UtmUpdate) => {
    const result = await updateUtm(id, utm);
    setUtms((prev) =>
      prev.map((item) => (item.id === id ? result : item))
    );
    setSelectedUtm(result);
    notification.success('UTM atualizado com sucesso!');
    return result;
  };

  const remove = async (id: string) => {
    await deleteUtm(id, userId);
    setUtms((prev) => prev.filter((item) => item.id !== id));
    setSelectedUtm(null);
    notification.success('UTM excluído com sucesso!');
  };

  const generateUtmUrl = (utm: Utm) => {
    const params = new URLSearchParams();
    params.append('utm_source', utm.source);
    params.append('utm_medium', utm.medium);
    if (utm.term) params.append('utm_term', utm.term);
    if (utm.content) params.append('utm_content', utm.content);
    params.append('utm_campaign', utm.campaign_name);

    return `${utm.base_url}${utm.base_url.includes('?') ? '&' : '?'}${params.toString()}`;
  };

  return {
    utms,
    selectedUtm,
    isLoadingUtms,
    isLoadingUtm,
    isCreating,
    isUpdating,
    isDeleting,
    fetchUtms,
    fetchUtm,
    create,
    update,
    remove,
    generateUtmUrl,
  };
} 