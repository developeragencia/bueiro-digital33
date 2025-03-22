import { type FC, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ApiConnectionProps {
  name: string;
  logo: string;
  status: 'connected' | 'disconnected' | 'error';
  onConnect: () => void;
  onDisconnect: () => void;
  credentials?: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

const ApiConnection: FC<ApiConnectionProps> = ({
  name,
  logo,
  status,
  onConnect,
  onDisconnect,
  credentials
}) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [formData, setFormData] = useState(credentials || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect();
    setIsConfiguring(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img src={logo} alt={name} className="w-10 h-10 object-contain" />
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <div className="flex items-center mt-1">
              {status === 'connected' ? (
                <div className="flex items-center text-green-600 text-sm">
                  <CheckCircle size={16} className="mr-1" />
                  Conectado
                </div>
              ) : status === 'error' ? (
                <div className="flex items-center text-red-600 text-sm">
                  <XCircle size={16} className="mr-1" />
                  Erro
                </div>
              ) : (
                <span className="text-sm text-gray-500">Desconectado</span>
              )}
            </div>
          </div>
        </div>

        {status === 'connected' ? (
          <button
            onClick={onDisconnect}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Desconectar
          </button>
        ) : (
          <button
            onClick={() => setIsConfiguring(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Conectar
          </button>
        )}
      </div>

      {isConfiguring && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {Object.entries(credentials || {}).map(([key]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key === 'apiKey' ? 'Chave da API' : 
                 key === 'clientId' ? 'Client ID' : 
                 'Client Secret'}
              </label>
              <input
                type="password"
                value={formData[key as keyof typeof formData] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder={`Digite ${key === 'apiKey' ? 'sua chave da API' : 
                            key === 'clientId' ? 'seu Client ID' : 
                            'seu Client Secret'}`}
              />
            </div>
          ))}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsConfiguring(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Conectar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ApiConnection;