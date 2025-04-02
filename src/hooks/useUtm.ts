import { useState, useEffect } from 'react';
import { utmService } from '../services/utm';
import { Utm } from '../types/supabase';
import { useToast } from '../lib/hooks/use-toast';

export function useUtm() {
  const [utms, setUtms] = useState<Utm[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadUtms();
  }, []);

  const loadUtms = async () => {
    try {
      const data = await utmService.getUtms();
      setUtms(data);
    } catch (error) {
      console.error('Error loading UTMs:', error);
      toast.error('Erro ao carregar UTMs');
    } finally {
      setLoading(false);
    }
  };

  const createUtm = async (utm: Partial<Utm>) => {
    try {
      await utmService.create(utm);
      toast.success('UTM criada com sucesso!');
      await loadUtms();
    } catch (error) {
      console.error('Error creating UTM:', error);
      toast.error('Erro ao criar UTM');
    }
  };

  const updateUtm = async (id: string, utm: Partial<Utm>) => {
    try {
      await utmService.update(id, utm);
      toast.success('UTM atualizada com sucesso!');
      await loadUtms();
    } catch (error) {
      console.error('Error updating UTM:', error);
      toast.error('Erro ao atualizar UTM');
    }
  };

  const deleteUtm = async (id: string) => {
    try {
      await utmService.delete(id);
      toast.success('UTM excluída com sucesso!');
      await loadUtms();
    } catch (error) {
      console.error('Error deleting UTM:', error);
      toast.error('Erro ao excluir UTM');
    }
  };

  return {
    utms,
    loading,
    createUtm,
    updateUtm,
    deleteUtm,
    loadUtms,
  };
} 