import React from 'react';

export const PaymentSettings: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Configurações de Pagamento</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Gateway de Pagamento</h2>
            <select className="w-full p-2 border rounded">
              <option>Stripe</option>
              <option>PayPal</option>
              <option>Mercado Pago</option>
            </select>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Chave de API</h2>
            <input type="password" className="w-full p-2 border rounded" value="********" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Webhook URL</h2>
            <input type="text" className="w-full p-2 border rounded" value="https://api.example.com/webhook" />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}; 