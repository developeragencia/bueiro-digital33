import { useState, type FC } from 'react';
import { Platform } from '../data/platforms';
import { Settings, Power, RefreshCw, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

interface PlatformCardProps {
  platform: Platform;
  status: 'connected' | 'disconnected' | 'error';
  onConnect: () => void;
  onDisconnect: () => void;
  onSync?: () => void;
  onSettings?: () => void;
  lastSync?: string;
  account?: string;
  index: number;
}

const PlatformCard: FC<PlatformCardProps> = ({
  platform,
  status,
  onConnect,
  onDisconnect,
  onSync,
  onSettings,
  lastSync,
  account,
  index
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const Icon = platform.icon;

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  const handleDisconnect = () => {
    setShowConfirm(true);
  };

  const confirmDisconnect = () => {
    handleAction(onDisconnect);
  };

  return (
    <div 
      className={`platform-card group ${
        index % 2 === 0 ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-gradient-to-br from-gray-50 to-white'
      } animate-scale-up relative`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        opacity: 0 
      }}
    >
      {showConfirm && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Desconectar {platform.name}?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta ação irá remover todas as configurações e dados sincronizados.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDisconnect}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Desconectar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="platform-logo group-hover:shadow-lg">
            {!imageError ? (
              <img
                src={platform.logo}
                alt={`${platform.name} logo`}
                onError={() => setImageError(true)}
                className="w-full h-full object-contain group-hover:scale-110"
              />
            ) : (
              <div className={`w-full h-full ${platform.color} flex items-center justify-center text-white group-hover:scale-110`}>
                <Icon size={24} />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {platform.name}
            </h3>
            <p className="text-sm text-gray-500">{platform.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {status === 'connected' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-fade-in">
              <CheckCircle size={12} className="mr-1" />
              Conectado
            </span>
          )}
          {status === 'disconnected' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Desconectado
            </span>
          )}
          {status === 'error' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
              <AlertCircle size={12} className="mr-1" />
              Erro
            </span>
          )}
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-600">{platform.description}</p>

      {account && (
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium">Conta:</span> {account}
        </div>
      )}

      {lastSync && (
        <div className="mt-2 text-sm text-gray-500">
          <span>Última sincronização: {lastSync}</span>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <Loader2 size={20} className="text-blue-600 animate-spin" />
          ) : status === 'connected' ? (
            <>
              {onSync && (
                <button 
                  onClick={() => handleAction(onSync)}
                  className="text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110"
                  title="Sincronizar"
                >
                  <RefreshCw size={18} />
                </button>
              )}
              {onSettings && (
                <button 
                  onClick={() => handleAction(onSettings)}
                  className="text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110"
                  title="Configurações"
                >
                  <Settings size={18} />
                </button>
              )}
              <button 
                onClick={handleDisconnect}
                className="text-gray-400 hover:text-red-600 transition-colors transform hover:scale-110"
                title="Desconectar"
              >
                <Power size={18} />
              </button>
            </>
          ) : status === 'error' ? (
            <button 
              onClick={() => handleAction(onConnect)}
              className="text-red-500 hover:text-red-600 transition-colors transform hover:scale-110"
              title="Reconectar"
            >
              <AlertCircle size={18} />
            </button>
          ) : (
            <button 
              onClick={() => handleAction(onConnect)}
              className="text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm hover:scale-105"
            >
              Conectar
            </button>
          )}
        </div>
        {status === 'connected' && onSettings && (
          <button 
            onClick={() => handleAction(onSettings)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium hover:scale-105"
          >
            Ver detalhes
          </button>
        )}
      </div>
    </div>
  );
};

export default PlatformCard;