import { useState } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number;
  totalUsers: number;
  usersChange: number;
  conversionRate: number;
  conversionChange: number;
  averageOrderValue: number;
  aovChange: number;
}

const mockData: AnalyticsData = {
  totalRevenue: 150000,
  revenueChange: 12.5,
  totalUsers: 25000,
  usersChange: 8.3,
  conversionRate: 3.2,
  conversionChange: -1.5,
  averageOrderValue: 89.99,
  aovChange: 5.7,
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState('7d');

  const stats = [
    {
      name: 'Receita Total',
      value: `R$ ${mockData.totalRevenue.toLocaleString()}`,
      change: mockData.revenueChange,
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Total de Usuários',
      value: mockData.totalUsers.toLocaleString(),
      change: mockData.usersChange,
      icon: UserGroupIcon,
    },
    {
      name: 'Taxa de Conversão',
      value: `${mockData.conversionRate}%`,
      change: mockData.conversionChange,
      icon: ArrowTrendingUpIcon,
    },
    {
      name: 'Ticket Médio',
      value: `R$ ${mockData.averageOrderValue.toFixed(2)}`,
      change: mockData.aovChange,
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="12m">Últimos 12 meses</option>
          </select>
        </div>

        {/* Cards de Métricas */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <item.icon
                        className="h-6 w-6 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {item.value}
                          </div>
                          <div
                            className={classNames(
                              item.change > 0
                                ? 'text-green-600'
                                : 'text-red-600',
                              'ml-2 flex items-baseline text-sm font-semibold'
                            )}
                          >
                            {item.change > 0 ? (
                              <ArrowUpIcon
                                className="self-center flex-shrink-0 h-5 w-5 text-green-500"
                                aria-hidden="true"
                              />
                            ) : (
                              <ArrowDownIcon
                                className="self-center flex-shrink-0 h-5 w-5 text-red-500"
                                aria-hidden="true"
                              />
                            )}
                            <span className="sr-only">
                              {item.change > 0 ? 'Aumentou' : 'Diminuiu'} por
                            </span>
                            {Math.abs(item.change)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráficos */}
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Gráfico de Receita */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Receita ao Longo do Tempo
            </h3>
            <div className="mt-2">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico será implementado aqui</p>
              </div>
            </div>
          </div>

          {/* Gráfico de Conversões */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Taxa de Conversão
            </h3>
            <div className="mt-2">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico será implementado aqui</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Fontes de Tráfego */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Fontes de Tráfego
              </h3>
              <div className="mt-4 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                          >
                            Fonte
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Usuários
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Conversões
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                          >
                            Taxa de Conversão
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            Google / CPC
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            12,500
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            450
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            3.6%
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            Facebook Ads
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            8,750
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            280
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            3.2%
                          </td>
                        </tr>
                        <tr>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            Orgânico
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            3,750
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            95
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            2.5%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 