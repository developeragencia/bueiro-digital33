import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Switch } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Settings() {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Implementar chamada à API para salvar configurações
      // await api.post('/settings', {
      //   emailNotifications,
      //   pushNotifications,
      //   darkMode,
      // });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Configurações</h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mt-8 space-y-6">
          {/* Perfil */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Perfil
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Notificações
              </h3>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Notificações por Email
                    </h4>
                    <p className="text-sm text-gray-500">
                      Receba atualizações sobre suas campanhas por email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onChange={setEmailNotifications}
                    className={classNames(
                      emailNotifications ? 'bg-blue-600' : 'bg-gray-200',
                      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    )}
                  >
                    <span className="sr-only">Notificações por Email</span>
                    <span
                      aria-hidden="true"
                      className={classNames(
                        emailNotifications ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                      )}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Notificações Push
                    </h4>
                    <p className="text-sm text-gray-500">
                      Receba notificações em tempo real no navegador
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onChange={setPushNotifications}
                    className={classNames(
                      pushNotifications ? 'bg-blue-600' : 'bg-gray-200',
                      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    )}
                  >
                    <span className="sr-only">Notificações Push</span>
                    <span
                      aria-hidden="true"
                      className={classNames(
                        pushNotifications ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                      )}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Aparência
              </h3>
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Modo Escuro
                    </h4>
                    <p className="text-sm text-gray-500">
                      Altere entre tema claro e escuro
                    </p>
                  </div>
                  <Switch
                    checked={darkMode}
                    onChange={setDarkMode}
                    className={classNames(
                      darkMode ? 'bg-blue-600' : 'bg-gray-200',
                      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    )}
                  >
                    <span className="sr-only">Modo Escuro</span>
                    <span
                      aria-hidden="true"
                      className={classNames(
                        darkMode ? 'translate-x-5' : 'translate-x-0',
                        'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                      )}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 