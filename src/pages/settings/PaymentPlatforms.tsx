import React, { useState } from 'react';
import { PaymentPlatform, PaymentPlatformConfig } from '../../types/payment';

export const PaymentPlatforms: React.FC = () => {
  const [platforms, setPlatforms] = useState<PaymentPlatformConfig[]>([
    {
      id: 'shopify',
      name: 'Shopify',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      enabled: false,
      testMode: true
    },
    {
      id: 'systeme',
      name: 'Systeme.io',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      enabled: false,
      testMode: true
    },
    {
      id: 'strivpay',
      name: 'StrivPay',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      enabled: false,
      testMode: true
    }
  ]);

  const handleToggleEnabled = (platformId: PaymentPlatform) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, enabled: !platform.enabled }
        : platform
    ));
  };

  const handleToggleTestMode = (platformId: PaymentPlatform) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, testMode: !platform.testMode }
        : platform
    ));
  };

  const handleUpdateConfig = (platformId: PaymentPlatform, field: keyof PaymentPlatformConfig, value: string | boolean) => {
    setPlatforms(platforms.map(platform => 
      platform.id === platformId 
        ? { ...platform, [field]: value }
        : platform
    ));
  };

  const handleSaveConfig = async (platform: PaymentPlatformConfig) => {
    try {
      // TODO: Implementar chamada à API para salvar configuração
      console.log('Salvando configuração:', platform);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Plataformas de Pagamento</h1>

      <div className="space-y-6">
        {platforms.map(platform => (
          <div key={platform.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{platform.name}</h2>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={platform.testMode}
                    onChange={() => handleToggleTestMode(platform.id)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Modo Teste
                  </span>
                </label>

                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={platform.enabled}
                    onChange={() => handleToggleEnabled(platform.id)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Ativo
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={platform.apiKey}
                  onChange={(e) => handleUpdateConfig(platform.id, 'apiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite sua API Key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  value={platform.secretKey}
                  onChange={(e) => handleUpdateConfig(platform.id, 'secretKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite sua Secret Key"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="text"
                  value={platform.webhookUrl}
                  onChange={(e) => handleUpdateConfig(platform.id, 'webhookUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://seu-dominio.com/api/webhooks/pagamentos"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleSaveConfig(platform)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 