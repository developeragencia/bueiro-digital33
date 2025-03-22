import React from 'react';
import { X } from 'lucide-react';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration: {
    name: string;
    icon: React.ReactNode;
    type: string;
    color: string;
  } | null;
}

export default function IntegrationModal({ isOpen, onClose, integration }: IntegrationModalProps) {
  if (!isOpen || !integration) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className={`p-3 rounded-xl ${integration.color} text-white`}>
              {integration.icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Conectar {integration.name}
              </h3>
              <p className="text-sm text-gray-500">{integration.type}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID da Conta
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Digite o ID da sua conta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chave de API
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Digite sua chave de API"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segredo da API
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Digite o segredo da sua API"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none"
              >
                Cancelar
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none ${integration.color} hover:opacity-90`}
              >
                Conectar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}