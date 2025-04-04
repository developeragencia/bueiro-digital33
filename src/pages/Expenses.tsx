import { useState } from 'react';
import { 
  Search,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  FileText
} from 'lucide-react';

const EXPENSES = [
  {
    id: 1,
    description: 'Ferramentas de Marketing',
    category: 'Software',
    value: 'R$ 299,90',
    date: '01/03/2024',
    status: 'Pago'
  },
  {
    id: 2,
    description: 'Consultoria de Mídia',
    category: 'Serviços',
    value: 'R$ 1.500,00',
    date: '05/03/2024',
    status: 'Pendente'
  }
];

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          <span>Nova Despesa</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center space-x-2">
                  <span>Descrição</span>
                  <ArrowUpDown size={16} className="text-gray-400" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Categoria</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Valor</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Data</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ações</th>
            </tr>
          </thead>
          <tbody>
            {EXPENSES.map((expense) => (
              <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-900">{expense.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{expense.category}</td>
                <td className="px-6 py-4 text-gray-900">{expense.value}</td>
                <td className="px-6 py-4 text-gray-500">{expense.date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    expense.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {expense.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-400 hover:text-gray-500">
                      <Edit2 size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <Trash2 size={16} />
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