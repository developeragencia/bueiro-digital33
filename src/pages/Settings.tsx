import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save,
  Loader2,
  AlertCircle,
  Globe,
  Palette,
  Mail
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

interface SiteSettings {
  general: {
    siteName: string;
    siteDescription: string;
    logo: string;
    favicon: string;
  };
  appearance: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  smtp: {
    host: string;
    port: string;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
}

export default function Settings() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings>({
    general: {
      siteName: '',
      siteDescription: '',
      logo: '',
      favicon: ''
    },
    appearance: {
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      fontFamily: 'Inter'
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    },
    smtp: {
      host: '',
      port: '',
      username: '',
      password: '',
      fromEmail: '',
      fromName: ''
    }
  });
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          type: 'main',
          settings 
        });

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (
    category: keyof SiteSettings,
    field: string,
    value: string
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'smtp', label: 'SMTP', icon: Mail }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-6 w-6 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        </div>
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Forms */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* General Settings */}
            <div className={activeTab === 'general' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSettings('general', 'siteName', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Description
                  </label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSettings('general', 'siteDescription', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    value={settings.general.logo}
                    onChange={(e) => updateSettings('general', 'logo', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    value={settings.general.favicon}
                    onChange={(e) => updateSettings('general', 'favicon', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className={activeTab === 'appearance' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={settings.appearance.primaryColor}
                    onChange={(e) => updateSettings('appearance', 'primaryColor', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <input
                    type="color"
                    value={settings.appearance.secondaryColor}
                    onChange={(e) => updateSettings('appearance', 'secondaryColor', e.target.value)}
                    className="w-full h-10 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    value={settings.appearance.fontFamily}
                    onChange={(e) => updateSettings('appearance', 'fontFamily', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={settings.seo.metaTitle}
                    onChange={(e) => updateSettings('seo', 'metaTitle', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={settings.seo.metaDescription}
                    onChange={(e) => updateSettings('seo', 'metaDescription', e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keywords
                  </label>
                  <input
                    type="text"
                    value={settings.seo.keywords}
                    onChange={(e) => updateSettings('seo', 'keywords', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Separate keywords with commas"
                  />
                </div>
              </div>
            </div>

            {/* SMTP Settings */}
            <div className={activeTab === 'smtp' ? 'block' : 'hidden'}>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.smtp.host}
                      onChange={(e) => updateSettings('smtp', 'host', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={settings.smtp.port}
                      onChange={(e) => updateSettings('smtp', 'port', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={settings.smtp.username}
                      onChange={(e) => updateSettings('smtp', 'username', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={settings.smtp.password}
                      onChange={(e) => updateSettings('smtp', 'password', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Email
                    </label>
                    <input
                      type="email"
                      value={settings.smtp.fromEmail}
                      onChange={(e) => updateSettings('smtp', 'fromEmail', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Name
                    </label>
                    <input
                      type="text"
                      value={settings.smtp.fromName}
                      onChange={(e) => updateSettings('smtp', 'fromName', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}