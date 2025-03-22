import { useState } from 'react';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface UTMParams {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

export default function UTMBuilder() {
  const [utmParams, setUtmParams] = useState<UTMParams>({
    url: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  });

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUtmParams((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const buildUTMUrl = () => {
    if (!utmParams.url || !isValidUrl(utmParams.url)) {
      setError('Por favor, insira uma URL válida');
      return '';
    }

    if (!utmParams.source || !utmParams.medium || !utmParams.campaign) {
      setError('Source, Medium e Campaign são campos obrigatórios');
      return '';
    }

    const url = new URL(utmParams.url);
    url.searchParams.append('utm_source', utmParams.source);
    url.searchParams.append('utm_medium', utmParams.medium);
    url.searchParams.append('utm_campaign', utmParams.campaign);

    if (utmParams.term) {
      url.searchParams.append('utm_term', utmParams.term);
    }
    if (utmParams.content) {
      url.searchParams.append('utm_content', utmParams.content);
    }

    return url.toString();
  };

  const handleCopy = async () => {
    const utmUrl = buildUTMUrl();
    if (utmUrl) {
      try {
        await navigator.clipboard.writeText(utmUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar URL:', err);
      }
    }
  };

  const utmUrl = buildUTMUrl();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">UTM Builder</h1>
        <p className="mt-2 text-sm text-gray-600">
          Crie URLs com parâmetros UTM para rastrear suas campanhas de marketing
        </p>

        <div className="mt-8 space-y-6">
          {/* URL Base */}
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700"
            >
              URL Base *
            </label>
            <div className="mt-1">
              <input
                type="url"
                name="url"
                id="url"
                value={utmParams.url}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="https://exemplo.com"
                required
              />
            </div>
          </div>

          {/* Campos Obrigatórios */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label
                htmlFor="source"
                className="block text-sm font-medium text-gray-700"
              >
                Source (utm_source) *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="source"
                  id="source"
                  value={utmParams.source}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="facebook"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="medium"
                className="block text-sm font-medium text-gray-700"
              >
                Medium (utm_medium) *
              </label>
              <div className="mt-1">
                <select
                  name="medium"
                  id="medium"
                  value={utmParams.medium}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="cpc">CPC</option>
                  <option value="social">Social</option>
                  <option value="email">Email</option>
                  <option value="display">Display</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="campaign"
                className="block text-sm font-medium text-gray-700"
              >
                Campaign (utm_campaign) *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="campaign"
                  id="campaign"
                  value={utmParams.campaign}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="black_friday_2024"
                  required
                />
              </div>
            </div>
          </div>

          {/* Campos Opcionais */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="term"
                className="block text-sm font-medium text-gray-700"
              >
                Term (utm_term)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="term"
                  id="term"
                  value={utmParams.term}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="marketing+digital"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700"
              >
                Content (utm_content)
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="content"
                  id="content"
                  value={utmParams.content}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="banner_topo"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {/* URL Gerada */}
          {utmUrl && (
            <div className="mt-6">
              <label
                htmlFor="generated-url"
                className="block text-sm font-medium text-gray-700"
              >
                URL Gerada
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <div className="relative flex items-stretch flex-grow focus-within:z-10">
                  <input
                    type="text"
                    name="generated-url"
                    id="generated-url"
                    value={utmUrl}
                    readOnly
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {copied ? (
                    <CheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  )}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 