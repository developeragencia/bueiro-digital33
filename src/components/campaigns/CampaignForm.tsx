import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../lib/hooks/use-toast';
import { campaignService } from '../../services/campaigns';
import { Campaign } from '../../types/supabase';
import { useAuth } from '../../hooks/useAuth';

interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit?: (campaign: Campaign) => void;
}

export function CampaignForm({ campaign, onSubmit }: CampaignFormProps) {
  const { user } = useAuth();
  const [name, setName] = useState(campaign?.name || '');
  const [description, setDescription] = useState(campaign?.description || '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'archived'>(campaign?.status || 'active');
  const [startDate, setStartDate] = useState(campaign?.start_date || '');
  const [endDate, setEndDate] = useState(campaign?.end_date || '');
  const [budget, setBudget] = useState(campaign?.budget?.toString() || '');
  const [targetAudience, setTargetAudience] = useState(campaign?.target_audience || '');
  const [objectives, setObjectives] = useState(campaign?.objectives || '');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name,
        description,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
        budget: budget ? parseFloat(budget) : null,
        target_audience: targetAudience || null,
        objectives: objectives || null,
        user_id: user?.id || ''
      };

      let result;
      if (campaign) {
        result = await campaignService.update(campaign.id, data);
        toast.success('Campanha atualizada com sucesso!');
      } else {
        result = await campaignService.create(data);
        toast.success('Campanha criada com sucesso!');
      }

      if (onSubmit) {
        onSubmit(result);
      } else {
        navigate('/campaigns');
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Erro ao salvar campanha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Data de Início
          </label>
          <div className="mt-1">
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            Data de Término
          </label>
          <div className="mt-1">
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
          Orçamento
        </label>
        <div className="mt-1">
          <input
            type="number"
            id="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            step="0.01"
            min="0"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
          Público-alvo
        </label>
        <div className="mt-1">
          <textarea
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            rows={2}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">
          Objetivos
        </label>
        <div className="mt-1">
          <textarea
            id="objectives"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            rows={2}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="mt-1">
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'archived')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
            <option value="archived">Arquivada</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate('/campaigns')}
          className="mr-3 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : campaign ? 'Atualizar' : 'Criar'}
        </button>
      </div>
    </form>
  );
} 