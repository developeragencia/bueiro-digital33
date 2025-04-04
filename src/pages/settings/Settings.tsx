import React from 'react';
import { Link } from 'react-router-dom';

export const Settings: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card de Plataformas de Pagamento */}
        <Link 
          to="/settings/payment-platforms"
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Plataformas de Pagamento</h2>
          <p className="text-gray-600">
            Gerencie suas integrações com plataformas de pagamento.
          </p>
        </Link>

        {/* Card de Configurações de Email */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Configurações de Email</h2>
          <p className="text-gray-600">
            Configure seus templates e notificações por email.
          </p>
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
            Em breve
          </span>
        </div>

        {/* Card de Usuários */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Usuários</h2>
          <p className="text-gray-600">
            Gerencie usuários e permissões do sistema.
          </p>
          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
            Em breve
          </span>
        </div>
      </div>
    </div>
  );
}; 