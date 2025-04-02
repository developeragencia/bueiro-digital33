import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PaymentPlatform, PlatformSettings } from '../../types/payment';
import { paymentPlatformService } from '../../services/payment';

interface PaymentPlatformSettingsProps {
  platform: PaymentPlatform;
  onUpdate: () => void;
}

export function PaymentPlatformSettings({ platform, onUpdate }: PaymentPlatformSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PlatformSettings>({
    client_id: platform.client_id,
    client_secret: platform.client_secret,
    webhook_url: platform.webhook_url,
    webhook_secret: platform.webhook_secret
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await paymentPlatformService.update(platform.id, {
        ...platform,
        client_id: settings.client_id,
        client_secret: settings.client_secret,
        webhook_url: settings.webhook_url,
        webhook_secret: settings.webhook_secret
      });

      toast.success('Configurações atualizadas com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      await paymentPlatformService.update(platform.id, {
        ...platform,
        is_active: !platform.is_active
      });

      toast.success(
        platform.is_active
          ? 'Plataforma desativada com sucesso!'
          : 'Plataforma ativada com sucesso!'
      );
      onUpdate();
    } catch (error) {
      console.error('Erro ao alterar status da plataforma:', error);
      toast.error('Erro ao alterar status da plataforma');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">{platform.name}</h3>
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md ${
            platform.is_active
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {platform.is_active ? 'Desativar' : 'Ativar'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client ID
          </label>
          <input
            type="text"
            value={settings.client_id}
            onChange={(e) =>
              setSettings({ ...settings, client_id: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client Secret
          </label>
          <input
            type="password"
            value={settings.client_secret}
            onChange={(e) =>
              setSettings({ ...settings, client_secret: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Webhook URL
          </label>
          <input
            type="text"
            value={settings.webhook_url}
            onChange={(e) =>
              setSettings({ ...settings, webhook_url: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Webhook Secret
          </label>
          <input
            type="password"
            value={settings.webhook_secret}
            onChange={(e) =>
              setSettings({ ...settings, webhook_secret: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
} 