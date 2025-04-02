import { useState } from 'react';
import { PaymentPlatformService } from '../services/PaymentPlatformService';
import { Database } from '../types/supabase';
import { useLoading } from './useLoading';
import { useNotification } from './useNotification';

type PaymentPlatform = Database['public']['Tables']['payment_platforms']['Row'];
type PaymentPlatformInsert = Database['public']['Tables']['payment_platforms']['Insert'];
type PaymentPlatformUpdate = Database['public']['Tables']['payment_platforms']['Update'];

export function usePayment(userId: string) {
  const [platforms, setPlatforms] = useState<PaymentPlatform[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<PaymentPlatform | null>(null);
  const notification = useNotification();

  const [loadPlatforms, isLoadingPlatforms] = useLoading(PaymentPlatformService.list);
  const [loadPlatform, isLoadingPlatform] = useLoading(PaymentPlatformService.get);
  const [createPlatform, isCreating] = useLoading(PaymentPlatformService.create);
  const [updatePlatform, isUpdating] = useLoading(PaymentPlatformService.update);
  const [deletePlatform, isDeleting] = useLoading(PaymentPlatformService.delete);

  const fetchPlatforms = async () => {
    const result = await loadPlatforms(userId);
    setPlatforms(result);
    return result;
  };

  const fetchPlatform = async (id: string) => {
    const result = await loadPlatform(id, userId);
    setSelectedPlatform(result);
    return result;
  };

  const create = async (platform: PaymentPlatformInsert) => {
    const result = await createPlatform(platform);
    setPlatforms((prev) => [result, ...prev]);
    notification.success('Plataforma de pagamento criada com sucesso!');
    return result;
  };

  const update = async (id: string, platform: PaymentPlatformUpdate) => {
    const result = await updatePlatform(id, platform);
    setPlatforms((prev) =>
      prev.map((item) => (item.id === id ? result : item))
    );
    setSelectedPlatform(result);
    notification.success('Plataforma de pagamento atualizada com sucesso!');
    return result;
  };

  const remove = async (id: string) => {
    await deletePlatform(id, userId);
    setPlatforms((prev) => prev.filter((item) => item.id !== id));
    setSelectedPlatform(null);
    notification.success('Plataforma de pagamento excluída com sucesso!');
  };

  const togglePlatform = async (id: string, isActive: boolean) => {
    const result = await updatePlatform(id, { is_active: isActive });
    setPlatforms((prev) =>
      prev.map((item) => (item.id === id ? result : item))
    );
    setSelectedPlatform(result);
    notification.success(
      `Plataforma de pagamento ${isActive ? 'ativada' : 'desativada'} com sucesso!`
    );
    return result;
  };

  return {
    platforms,
    selectedPlatform,
    isLoadingPlatforms,
    isLoadingPlatform,
    isCreating,
    isUpdating,
    isDeleting,
    fetchPlatforms,
    fetchPlatform,
    create,
    update,
    remove,
    togglePlatform,
  };
} 