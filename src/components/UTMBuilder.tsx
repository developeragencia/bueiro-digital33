import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Copy, Plus, Trash2, CheckCircle } from 'lucide-react';

interface UTM {
  id: string;
  name: string;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

const SOURCES = ['google', 'facebook', 'instagram', 'linkedin', 'tiktok', 'email', 'newsletter'];
const MEDIUMS = ['cpc', 'social', 'email', 'banner', 'affiliate'];

export default function UTMBuilder() {
  const [utms, setUtms] = useState<UTM[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [newUtm, setNewUtm] = useState<UTM>({
    id: uuidv4(),
    name: '',
    baseUrl: '',
    source: SOURCES[0],
    medium: MEDIUMS[0],
    campaign: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUtm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUtm.name || !newUtm.baseUrl || !newUtm.campaign) return;

    setUtms(prev => [...prev, newUtm]);
    setNewUtm({
      id: uuidv4(),
      name: '',
      baseUrl: '',
      source: SOURCES[0],
      medium: MEDIUMS[0],
      campaign: '',
    });
  };

  const handleDelete = (id: string) => {
    setUtms(prev => prev.filter(utm => utm.id !== id));
  };

  const buildUtmUrl = (utm: UTM) => {
    const params = new URLSearchParams();
    params.append('utm_source', utm.source);
    params.append('utm_medium', utm.medium);
    params.append('utm_campaign', utm.campaign);
    if (utm.term) params.append('utm_term', utm.term);
    if (utm.content) params.append('utm_content', utm.content);

    const baseUrl = utm.baseUrl.endsWith('/') ? utm.baseUrl.slice(0, -1) : utm.baseUrl;
    return `${baseUrl}?${params.toString()}`;
  };

  const copyToClipboard = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Campanha
            </label>
            <input
              type="text"
              name="name"
              value={newUtm.name}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Ex: Black Friday 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Base
            </label>
            <input
              type="url"
              name="baseUrl"
              value={newUtm.baseUrl}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="https://exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fonte (utm_source)
            </label>
            <select
              name="source"
              value={newUtm.source}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {SOURCES.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meio (utm_medium)
            </label>
            <select
              name="medium"
              value={newUtm.medium}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {MEDIUMS.map(medium => (
                <option key={medium} value={medium}>{medium}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campanha (utm_campaign)
            </label>
            <input
              type="text"
              name="campaign"
              value={newUtm.campaign}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Ex: black_friday_2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Termo (utm_term) - Opcional
            </label>
            <input
              type="text"
              name="term"
              value={newUtm.term || ''}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Ex: tenis_corrida"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo (utm_content) - Opcional
            </label>
            <input
              type="text"
              name="content"
              value={newUtm.content || ''}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Ex: banner_topo"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Gerar UTM</span>
          </button>
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            UTMs Gerados
          </h3>
          <div className="space-y-4">
            {utms.map(utm => (
              <div
                key={utm.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{utm.name}</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(utm.id, buildUtmUrl(utm))}
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                      {copied === utm.id ? (
                        <CheckCircle size={20} className="text-green-500" />
                      ) : (
                        <Copy size={20} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(utm.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 break-all">
                  {buildUtmUrl(utm)}
                </p>
              </div>
            ))}
            {utms.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Nenhum UTM gerado ainda
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}