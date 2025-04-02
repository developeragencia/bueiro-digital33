import { useState } from 'react';
import { CampaignService } from '../services/CampaignService';
import { Database } from '../types/supabase';
import { useLoading } from './useLoading';
import { useNotification } from './useNotification';

type Campaign = Database['public']['Tables']['campaigns']['Row'];
type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

export function useCampaign(userId: string) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const notification = useNotification();

  const [loadCampaigns, isLoadingCampaigns] = useLoading(CampaignService.list);
  const [loadCampaign, isLoadingCampaign] = useLoading(CampaignService.get);
  const [createCampaign, isCreating] = useLoading(CampaignService.create);
  const [updateCampaign, isUpdating] = useLoading(CampaignService.update);
  const [deleteCampaign, isDeleting] = useLoading(CampaignService.delete);

  const fetchCampaigns = async () => {
    const result = await loadCampaigns(userId);
    setCampaigns(result);
    return result;
  };

  const fetchCampaign = async (id: string) => {
    const result = await loadCampaign(id, userId);
    setSelectedCampaign(result);
    return result;
  };

  const create = async (campaign: CampaignInsert) => {
    const result = await createCampaign(campaign);
    setCampaigns((prev) => [result, ...prev]);
    notification.success('Campanha criada com sucesso!');
    return result;
  };

  const update = async (id: string, campaign: CampaignUpdate) => {
    const result = await updateCampaign(id, campaign);
    setCampaigns((prev) =>
      prev.map((item) => (item.id === id ? result : item))
    );
    setSelectedCampaign(result);
    notification.success('Campanha atualizada com sucesso!');
    return result;
  };

  const remove = async (id: string) => {
    await deleteCampaign(id, userId);
    setCampaigns((prev) => prev.filter((item) => item.id !== id));
    setSelectedCampaign(null);
    notification.success('Campanha excluída com sucesso!');
  };

  return {
    campaigns,
    selectedCampaign,
    isLoadingCampaigns,
    isLoadingCampaign,
    isCreating,
    isUpdating,
    isDeleting,
    fetchCampaigns,
    fetchCampaign,
    create,
    update,
    remove,
  };
} 