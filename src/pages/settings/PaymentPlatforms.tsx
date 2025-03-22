import { useState, useEffect } from 'react';
import { PaymentPlatformConfig, PaymentPlatform } from '../../types/payment';
import { PaymentPlatformService } from '../../services/payment/PaymentPlatformService';
import { Switch } from '@headlessui/react';

const platformService = new PaymentPlatformService();

const PLATFORM_NAMES: Record<PaymentPlatform, string> = {
  shopify: 'Shopify',
  systeme: 'Systeme',
  strivpay: 'StrivPay',
  appmax: 'Appmax',
  pepper: 'Pepper',
  logzz: 'Logzz',
  maxweb: 'MaxWeb',
  digistore24: 'Digistore24',
  fortpay: 'FortPay',
  clickbank: 'ClickBank',
  cartpanda: 'CartPanda',
  doppus: 'Doppus',
  nitro: 'Nitro',
  mundpay: 'MundPay',
  pagtrust: 'PagTrust',
  hubla: 'Hubla',
  ticto: 'Ticto',
  kiwify: 'Kiwify',
  frc: 'FRC'
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PaymentPlatforms() {
  const [platforms, setPlatforms] = useState<PaymentPlatformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      const configs = await platformService.getAllConfigs();
      setPlatforms(configs);
    } catch (error) {
      console.error('Erro ao carregar plataformas:', error);
      setError('Erro ao carregar plataformas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlatform = async (platform: PaymentPlatformConfig) => {
    try {
      await platformService.updateConfig(platform.id, {
        enabled: !platform.enabled,
      });
      setPlatforms(platforms.map(p => 
        p.id === platform.id ? { ...p, enabled: !p.enabled } : p
      ));
    } catch (error) {
      console.error('Erro ao atualizar plataforma:', error);
      setError('Erro ao atualizar plataforma. Tente novamente.');
    }
  };

  const handleSaveConfig = async (platform: PaymentPlatformConfig) => {
    try {
      await platformService.saveConfig(platform);
      setPlatforms(platforms.map(p => 
        p.id === platform.id ? platform : p
      ));
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setError('Erro ao salvar configuração. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Plataformas de Pagamento
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure suas integrações com plataformas de pagamento
        </p>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          {Object.entries(PLATFORM_NAMES).map(([key, name]) => {
            const platform = platforms.find(p => p.name === key) || {
              id: key,
              name: key as PaymentPlatform,
              apiKey: '',
              enabled: false,
              sandbox: true,
            };

            return (
              <div key={key} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={`/platforms/${key}.png`}
                      alt={name}
                      className="h-8 w-8"
                    />
                    <h3 className="ml-3 text-lg font-medium text-gray-900">
                      {name}
                    </h3>
                  </div>
                  <Switch
                    checked={platform.enabled}
                    onChange={() => handleTogglePlatform(platform)}
                    className={classNames(
                      platform.enabled ? 'bg-blue-600' : 'bg-gray-200',
                      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    )}
                  >
                    <span className="sr-only">Ativar {name}</span>
                    <span
                      className={classNames(
                        platform.enabled ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                      )}
                    />
                  </Switch>
                </div>

                {platform.enabled && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label
                        htmlFor={`${key}-apiKey`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        API Key
                      </label>
                      <input
                        type="text"
                        id={`${key}-apiKey`}
                        value={platform.apiKey}
                        onChange={(e) =>
                          setPlatforms(platforms.map(p =>
                            p.id === platform.id
                              ? { ...p, apiKey: e.target.value }
                              : p
                          ))
                        }
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    {platform.secretKey !== undefined && (
                      <div>
                        <label
                          htmlFor={`${key}-secretKey`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Secret Key
                        </label>
                        <input
                          type="password"
                          id={`${key}-secretKey`}
                          value={platform.secretKey}
                          onChange={(e) =>
                            setPlatforms(platforms.map(p =>
                              p.id === platform.id
                                ? { ...p, secretKey: e.target.value }
                                : p
                            ))
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}

                    {platform.merchantId !== undefined && (
                      <div>
                        <label
                          htmlFor={`${key}-merchantId`}
                          className="block text-sm font-medium text-gray-700"
                        >
                          Merchant ID
                        </label>
                        <input
                          type="text"
                          id={`${key}-merchantId`}
                          value={platform.merchantId}
                          onChange={(e) =>
                            setPlatforms(platforms.map(p =>
                              p.id === platform.id
                                ? { ...p, merchantId: e.target.value }
                                : p
                            ))
                          }
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor={`${key}-sandbox`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Ambiente
                      </label>
                      <select
                        id={`${key}-sandbox`}
                        value={platform.sandbox ? 'sandbox' : 'production'}
                        onChange={(e) =>
                          setPlatforms(platforms.map(p =>
                            p.id === platform.id
                              ? { ...p, sandbox: e.target.value === 'sandbox' }
                              : p
                          ))
                        }
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="sandbox">Sandbox</option>
                        <option value="production">Produção</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveConfig(platform)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Salvar Configurações
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 