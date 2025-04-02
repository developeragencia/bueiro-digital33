import { useState, useEffect } from 'react';
import { PaymentPlatformService } from '../../services/payment/PaymentPlatformService';
import { PaymentPlatform, PlatformSettings } from '../../types/payment';
import { useToast } from '../../lib/hooks/use-toast';

export function PaymentPlatformSettings() {
  const [platforms, setPlatforms] = useState<PaymentPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const data = await PaymentPlatformService.getPlatforms();
      setPlatforms(data);
    } catch (error) {
      toast.error('Erro ao carregar plataformas de pagamento');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (platform: PaymentPlatform, settings: Partial<PlatformSettings>) => {
    try {
      setIsSubmitting(true);
      await PaymentPlatformService.updatePlatform(platform.id, {
        ...platform,
        settings: {
          ...platform.settings,
          ...settings
        }
      });
      toast.success('Configurações atualizadas com sucesso!');
      loadPlatforms();
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (platform: PaymentPlatform) => {
    try {
      setIsSubmitting(true);
      await PaymentPlatformService.updatePlatform(platform.id, {
        ...platform,
        is_active: !platform.is_active
      });
      toast.success(
        `Plataforma ${platform.is_active ? 'desativada' : 'ativada'} com sucesso!`
      );
      loadPlatforms();
    } catch (error) {
      toast.error('Erro ao alterar status da plataforma');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            Plataformas de Pagamento
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure suas plataformas de pagamento
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className="bg-white shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {platform.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {platform.description}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(platform)}
                  disabled={isSubmitting}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    platform.is_active ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      platform.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor={`${platform.id}-client_id`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Client ID
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id={`${platform.id}-client_id`}
                      value={platform.settings.client_id || ''}
                      onChange={(e) =>
                        handleSubmit(platform, {
                          client_id: e.target.value
                        })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor={`${platform.id}-client_secret`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Client Secret
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id={`${platform.id}-client_secret`}
                      value={platform.settings.client_secret || ''}
                      onChange={(e) =>
                        handleSubmit(platform, {
                          client_secret: e.target.value
                        })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor={`${platform.id}-webhook_url`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Webhook URL
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id={`${platform.id}-webhook_url`}
                      value={platform.settings.webhook_url || ''}
                      onChange={(e) =>
                        handleSubmit(platform, {
                          webhook_url: e.target.value
                        })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor={`${platform.id}-webhook_secret`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Webhook Secret
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id={`${platform.id}-webhook_secret`}
                      value={platform.settings.webhook_secret || ''}
                      onChange={(e) =>
                        handleSubmit(platform, {
                          webhook_secret: e.target.value
                        })
                      }
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 