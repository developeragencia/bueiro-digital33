import { useState } from 'react';
import { Plus, Trash2, Facebook, ExternalLink, RefreshCw } from 'lucide-react';

interface FacebookAccount {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  lastSync?: string;
  adAccounts?: number;
}

export default function FacebookAccountManager() {
  const [accounts, setAccounts] = useState<FacebookAccount[]>([
    {
      id: '1',
      name: 'Conta Principal',
      status: 'connected',
      lastSync: '10 minutos atrás',
      adAccounts: 3
    }
  ]);

  const handleConnect = () => {
    // Here would go the Facebook OAuth logic
    const newAccount: FacebookAccount = {
      id: String(accounts.length + 1),
      name: `Conta ${accounts.length + 1}`,
      status: 'connected',
      lastSync: 'Agora',
      adAccounts: 1
    };
    setAccounts([...accounts, newAccount]);
  };

  const handleDisconnect = (id: string) => {
    setAccounts(accounts.filter(account => account.id !== id));
  };

  const handleSync = (id: string) => {
    setAccounts(accounts.map(account => 
      account.id === id 
        ? { ...account, lastSync: 'Agora' }
        : account
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Facebook className="h-6 w-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Contas do Facebook</h2>
        </div>
        <button
          onClick={handleConnect}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Conectar Nova Conta</span>
        </button>
      </div>

      <div className="space-y-4">
        {accounts.map(account => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Facebook className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{account.name}</h3>
                  <ExternalLink size={16} className="text-gray-400" />
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>{account.adAccounts} contas de anúncio</span>
                  <span>•</span>
                  <span>Última sincronização: {account.lastSync}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSync(account.id)}
                className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                title="Sincronizar"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => handleDisconnect(account.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Desconectar"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}

        {accounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Facebook className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Nenhuma conta do Facebook conectada</p>
            <p className="text-sm mt-1">Clique no botão acima para conectar uma conta</p>
          </div>
        )}
      </div>
    </div>
  );
}