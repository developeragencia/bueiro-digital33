import { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { PLATFORMS, CATEGORIES, Platform } from '../data/platforms';
import PlatformCard from '../components/PlatformCard';
import PlatformModal from '../components/PlatformModal';
import IntegrationSetup from '../components/IntegrationSetup';
import { useToast } from '../hooks/use-toast';
import { getIntegrationSettings, saveIntegrationSettings } from '../lib/integrations';

interface IntegrationStatus {
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  account?: string;
}

export default function Integrations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, IntegrationStatus>>({});
  const [showSetup, setShowSetup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    loadIntegrationStatuses();
  }, []);

  const loadIntegrationStatuses = async () => {
    try {
      setLoading(true);
      const statuses: Record<string, IntegrationStatus> = {};
      
      for (const platform of PLATFORMS) {
        const settings = await getIntegrationSettings(platform.id);
        if (settings) {
          statuses[platform.id] = {
            status: 'connected',
            lastSync: 'Há 1 hora',
            account: settings.settings.id
          };
        } else {
          statuses[platform.id] = {
            status: 'disconnected'
          };
        }
      }
      
      setIntegrationStatuses(statuses);
      setError(null);
    } catch (err) {
      console.error('Error loading integration statuses:', err);
      setError('Erro ao carregar status das integrações');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlatforms = PLATFORMS.filter(platform => {
    const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Todos' || platform.category === selectedType;
    return matchesSearch && matchesType;
  });

  const handleConnect = (platform: Platform) => {
    if (platform.id === 'ticto' || platform.id === 'clickbank' || platform.id === 'buygoods') {
      setShowSetup(platform.id);
    } else {
      setSelectedPlatform(platform);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (data: Record<string, string>) => {
    if (!selectedPlatform) return;

    try {
      await saveIntegrationSettings(selectedPlatform.id, data);
      
      setIntegrationStatuses(prev => ({
        ...prev,
        [selectedPlatform.id]: {
          status: 'connected',
          lastSync: 'Agora',
          account: 'Conta Principal'
        }
      }));

      toast.success('Plataforma conectada com sucesso!');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error connecting platform:', err);
      toast.error('Erro ao conectar plataforma');
    }
  };

  const handleDisconnect = async (platformId: string) => {
    try {
      // Here you would typically make an API call to disconnect the platform
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setIntegrationStatuses(prev => ({
        ...prev,
        [platformId]: {
          status: 'disconnected'
        }
      }));
      
      toast.success('Plataforma desconectada com sucesso!');
    } catch (err) {
      console.error('Error disconnecting platform:', err);
      toast.error('Erro ao desconectar plataforma');
    }
  };

  const handleSync = async (platformId: string) => {
    try {
      // Here you would typically make an API call to sync the platform
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setIntegrationStatuses(prev => ({
        ...prev,
        [platformId]: {
          ...prev[platformId],
          lastSync: 'Agora'
        }
      }));
      
      toast.success('Sincronização concluída com sucesso!');
    } catch (err) {
      console.error('Error syncing platform:', err);
      toast.error('Erro ao sincronizar plataforma');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar integrações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
            />
          </div>
          <div className="flex items-center space-x-2">
            {['Todos', ...CATEGORIES].map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedType(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedType === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showSetup && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-scale-up">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Configurar {showSetup.toUpperCase()}
          </h2>
          <IntegrationSetup
            platform={showSetup}
            onSave={() => {
              setIntegrationStatuses(prev => ({
                ...prev,
                [showSetup]: {
                  status: 'connected',
                  lastSync: 'Agora',
                  account: 'Configurado'
                }
              }));
              setShowSetup(null);
              toast.success('Configuração salva com sucesso!');
            }}
          />
        </div>
      )}

      {/* Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filteredPlatforms.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhuma integração encontrada</p>
          </div>
        ) : (
          filteredPlatforms.map((platform, index) => (
            <PlatformCard
              key={platform.id}
              platform={platform}
              status={integrationStatuses[platform.id]?.status || 'disconnected'}
              lastSync={integrationStatuses[platform.id]?.lastSync}
              account={integrationStatuses[platform.id]?.account}
              onConnect={() => handleConnect(platform)}
              onDisconnect={() => handleDisconnect(platform.id)}
              onSync={() => handleSync(platform.id)}
              onSettings={() => handleConnect(platform)}
              index={index}
            />
          ))
        )}
      </div>

      <PlatformModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platform={selectedPlatform}
        onSubmit={handleSubmit}
      />
    </div>
  );
}