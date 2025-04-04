import React, { useState, useEffect } from 'react';
import { AlertCircle, Copy, CheckCircle, Loader2 } from 'lucide-react';
import { INTEGRATION_CONFIGS, getIntegrationSettings, saveIntegrationSettings } from '../lib/integrations';
import { useToast } from '../hooks/use-toast';

interface IntegrationSetupProps {
  platform: string;
  onSave: (config: any) => Promise<void>;
}

type IntegrationConfig = {
  name: string;
  webhookUrl: string;
  requiresId: boolean;
  requiresSecretKey?: boolean;
  events?: Record<string, { template: string }>;
};

export const IntegrationSetup: React.FC<IntegrationSetupProps> = ({ platform, onSave }) => {
  const [id, setId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const { success, error: showError } = useToast();

  const config = INTEGRATION_CONFIGS[platform as keyof typeof INTEGRATION_CONFIGS] as IntegrationConfig;

  useEffect(() => {
    loadSettings();
  }, [platform]);

  const loadSettings = async () => {
    try {
      const settings = await getIntegrationSettings(platform);
      if (settings) {
        setId(settings.settings.id || '');
        setSecretKey(settings.settings.secretKey || '');
        updateWebhookUrl(settings.settings.id);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Erro ao carregar configurações');
    }
  };

  const updateWebhookUrl = (newId: string) => {
    if (!newId) {
      setWebhookUrl('');
      return;
    }

    try {
      if (platform === 'buygoods' && config.events) {
        const approvedUrl = INTEGRATION_CONFIGS.buygoods.webhookUrl + config.events.sale_approved.template + '&id=' + newId;
        const refundedUrl = INTEGRATION_CONFIGS.buygoods.webhookUrl + config.events.sale_refunded.template + '&id=' + newId;
        setWebhookUrl(`${approvedUrl}\n${refundedUrl}`);
      } else {
        setWebhookUrl(`${config.webhookUrl}?id=${newId}`);
      }
    } catch (err) {
      console.error('Error updating webhook URL:', err);
      setError('Erro ao gerar URL do webhook');
    }
  };

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTestStatus('success');
      success('Conexão testada com sucesso!');
    } catch (err) {
      setTestStatus('error');
      showError('Erro ao testar conexão');
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const settings = {
        id,
        ...(config.requiresSecretKey && { secretKey })
      };

      await saveIntegrationSettings(platform, settings);
      success('Configurações salvas com sucesso!');
      await onSave(settings);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Erro ao salvar configurações');
      showError('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      success('URL copiada para a área de transferência');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      showError('Erro ao copiar URL');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID da Integração
        </label>
        <input
          type="text"
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            updateWebhookUrl(e.target.value);
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          placeholder="Digite o ID da integração"
        />
      </div>

      {config.requiresSecretKey && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chave Secreta
          </label>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            placeholder="Digite a chave secreta"
          />
        </div>
      )}

      {webhookUrl && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL do Webhook
          </label>
          <div className="relative">
            <textarea
              readOnly
              value={webhookUrl}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10"
              rows={webhookUrl.includes('\n') ? 4 : 2}
            />
            <button
              onClick={copyToClipboard}
              className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-500"
            >
              {copied ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          onClick={testConnection}
          disabled={loading || testStatus === 'testing' || !id || (config.requiresSecretKey && !secretKey)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {testStatus === 'testing' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Testando...</span>
            </>
          ) : testStatus === 'success' ? (
            <>
              <CheckCircle size={16} className="text-green-500" />
              <span>Teste bem-sucedido</span>
            </>
          ) : testStatus === 'error' ? (
            <>
              <AlertCircle size={16} className="text-red-500" />
              <span>Falha no teste</span>
            </>
          ) : (
            <span>Testar Conexão</span>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={loading || !id || (config.requiresSecretKey && !secretKey)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <span>Salvar</span>
          )}
        </button>
      </div>
    </div>
  );
};