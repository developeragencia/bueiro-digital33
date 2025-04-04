import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total de Vendas</h2>
          <p className="text-3xl font-bold">R$ 15.750,00</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Clientes Ativos</h2>
          <p className="text-3xl font-bold">127</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Taxa de Conversão</h2>
          <p className="text-3xl font-bold">2.4%</p>
        </div>
      </div>
    </div>
  );
};