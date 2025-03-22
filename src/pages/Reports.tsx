import { useState } from 'react';
import { 
  Search,
  Download,
  ArrowUpDown,
  FileText,
  Calendar,
  BarChart2
} from 'lucide-react';

const REPORTS = [
  {
    id: 1,
    name: 'Relatório de Performance',
    type: 'Performance',
    period: 'Março 2024',
    generated: '10/03/2024',
    format: 'PDF'
  },
  {
    id: 2,
    name: 'Análise de Campanhas',
    type: 'Campanhas',
    period: 'Q1 2024',
    generated: '01/03/2024',
    format: 'XLSX'
  }
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar relatórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar size={20} />
            <span>Agendar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <BarChart2 size={20} />
            <span>Gerar Relatório</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center space-x-2">
                  <span>Nome</span>
                  <ArrowUpDown size={16} className="text-gray-400" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Período</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Gerado em</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Formato</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((report) => (
              <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{report.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{report.type}</td>
                <td className="px-6 py-4 text-gray-500">{report.period}</td>
                <td className="px-6 py-4 text-gray-500">{report.generated}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {report.format}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-gray-500">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}