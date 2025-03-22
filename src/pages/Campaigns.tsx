import { useState } from 'react';
import { 
  Search,
  Plus,
  MoreVertical,
  ArrowUpDown,
  ExternalLink,
  Pencil,
  Trash2
} from 'lucide-react';

const CAMPAIGNS = [
  {
    id: 1,
    name: 'Black Friday 2023',
    status: 'Ativo',
    platform: 'Facebook',
    budget: 'R$ 5.000,00',
    spent: 'R$ 3.245,67',
    results: 157,
    cpa: 'R$ 20,67',
    roas: 2.4
  },
  {
    id: 2,
    name: 'Lançamento Produto X',
    status: 'Pausado',
    platform: 'Google Ads',
    budget: 'R$ 3.000,00',
    spent: 'R$ 2.890,45',
    results: 98,
    cpa: 'R$ 29,49',
    roas: 1.8
  }
];

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar campanhas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>Nova Campanha</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center space-x-2">
                  <span>Campanha</span>
                  <ArrowUpDown size={16} className="text-gray-400" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Plataforma</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Orçamento</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Gasto</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Resultados</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">CPA</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ROAS</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody>
            {CAMPAIGNS.map((campaign) => (
              <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{campaign.name}</span>
                    <ExternalLink size={16} className="text-gray-400" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{campaign.platform}</td>
                <td className="px-6 py-4 text-gray-900">{campaign.budget}</td>
                <td className="px-6 py-4 text-gray-900">{campaign.spent}</td>
                <td className="px-6 py-4 text-gray-900">{campaign.results}</td>
                <td className="px-6 py-4 text-gray-900">{campaign.cpa}</td>
                <td className="px-6 py-4 text-gray-900">{campaign.roas}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-gray-500">
                      <Pencil size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <Trash2 size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}