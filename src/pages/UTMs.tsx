import { useState } from 'react';
import { 
  Search,
  Plus,
  Copy,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  ExternalLink,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import UTMBuilder from '../components/UTMBuilder';

const UTMS = [
  {
    id: 1,
    name: 'Black Friday - Facebook',
    url: 'https://example.com?utm_source=facebook&utm_medium=cpc&utm_campaign=black_friday',
    source: 'Facebook',
    medium: 'CPC',
    campaign: 'black_friday',
    active: true,
    clicks: 1250,
    conversions: 45
  },
  {
    id: 2,
    name: 'Newsletter - Email',
    url: 'https://example.com?utm_source=email&utm_medium=newsletter&utm_campaign=weekly',
    source: 'Email',
    medium: 'Newsletter',
    campaign: 'weekly',
    active: false,
    clicks: 890,
    conversions: 32
  }
];

export default function UTMs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar UTMs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              <span>Filtros</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <SlidersHorizontal size={20} />
              <span>Colunas</span>
            </button>
          </div>
          <button 
            onClick={() => setIsBuilderOpen(!isBuilderOpen)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Novo UTM</span>
          </button>
        </div>
      </div>

      {/* UTM Builder */}
      {isBuilderOpen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <UTMBuilder />
        </div>
      )}

      {/* UTMs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>Nome</span>
                    <ArrowUpDown size={16} className="text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">URL</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Source</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Medium</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Campaign</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Clicks</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Conversões</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {UTMS.map((utm) => (
                <tr key={utm.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{utm.name}</span>
                      <ExternalLink size={16} className="text-gray-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 truncate max-w-xs">{utm.url}</span>
                      <button className="text-gray-400 hover:text-gray-500">
                        <Copy size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{utm.source}</td>
                  <td className="px-6 py-4 text-gray-500">{utm.medium}</td>
                  <td className="px-6 py-4 text-gray-500">{utm.campaign}</td>
                  <td className="px-6 py-4">
                    {utm.active ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900">{utm.clicks}</td>
                  <td className="px-6 py-4 text-gray-900">{utm.conversions}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-500">
                      <Copy size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}