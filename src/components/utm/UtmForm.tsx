import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { UtmService } from '../../services/utm';
import { CampaignService } from '../../services/campaigns';
import { Utm, Campaign } from '../../types/supabase';
import toast from 'react-hot-toast';

const utmSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  base_url: z.string().url('URL inválida'),
  campaign_id: z.string().min(1, 'Campanha é obrigatória'),
  source: z.string().min(1, 'Fonte é obrigatória'),
  medium: z.string().min(1, 'Meio é obrigatório'),
  term: z.string().optional(),
  content: z.string().optional(),
});

type UtmFormData = z.infer<typeof utmSchema>;

export function UtmForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UtmFormData>({
    resolver: zodResolver(utmSchema),
  });

  useEffect(() => {
    loadCampaigns();
    if (id) {
      loadUtm();
    }
  }, [id]);

  const loadCampaigns = async () => {
    try {
      const data = await CampaignService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      toast.error('Erro ao carregar campanhas');
      console.error(error);
    }
  };

  const loadUtm = async () => {
    try {
      setIsLoading(true);
      const utm = await UtmService.getUtmById(id!);
      reset({
        name: utm.name,
        base_url: utm.base_url,
        campaign_id: utm.campaign_id,
        source: utm.source,
        medium: utm.medium,
        term: utm.term || '',
        content: utm.content || '',
      });
    } catch (error) {
      toast.error('Erro ao carregar UTM');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: UtmFormData) => {
    try {
      setIsSubmitting(true);
      if (id) {
        await UtmService.updateUtm(id, data);
        toast.success('UTM atualizado com sucesso!');
      } else {
        await UtmService.createUtm(data);
        toast.success('UTM criado com sucesso!');
      }
      navigate('/utms');
    } catch (error) {
      toast.error('Erro ao salvar UTM');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseUrl = watch('base_url');
  const source = watch('source');
  const medium = watch('medium');
  const term = watch('term');
  const content = watch('content');

  const generateCompleteUrl = () => {
    if (!baseUrl) return '';

    const params = new URLSearchParams();
    if (source) params.append('utm_source', source);
    if (medium) params.append('utm_medium', medium);
    if (term) params.append('utm_term', term);
    if (content) params.append('utm_content', content);

    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {id ? 'Editar UTM' : 'Novo UTM'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              type="text"
              {...register('name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="base_url"
              className="block text-sm font-medium text-gray-700"
            >
              URL Base
            </label>
            <input
              type="url"
              {...register('base_url')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.base_url && (
              <p className="mt-1 text-sm text-red-600">
                {errors.base_url.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="campaign_id"
              className="block text-sm font-medium text-gray-700"
            >
              Campanha
            </label>
            <select
              {...register('campaign_id')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Selecione uma campanha</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            {errors.campaign_id && (
              <p className="mt-1 text-sm text-red-600">
                {errors.campaign_id.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="source"
              className="block text-sm font-medium text-gray-700"
            >
              Fonte (utm_source)
            </label>
            <input
              type="text"
              {...register('source')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.source && (
              <p className="mt-1 text-sm text-red-600">{errors.source.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="medium"
              className="block text-sm font-medium text-gray-700"
            >
              Meio (utm_medium)
            </label>
            <input
              type="text"
              {...register('medium')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.medium && (
              <p className="mt-1 text-sm text-red-600">{errors.medium.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="term"
              className="block text-sm font-medium text-gray-700"
            >
              Termo (utm_term)
            </label>
            <input
              type="text"
              {...register('term')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700"
            >
              Conteúdo (utm_content)
            </label>
            <input
              type="text"
              {...register('content')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Link Completo
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                readOnly
                value={generateCompleteUrl()}
                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generateCompleteUrl());
                  toast.success('Link copiado para a área de transferência!');
                }}
                className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Copiar
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/utms')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 