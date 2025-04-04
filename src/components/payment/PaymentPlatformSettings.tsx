import { useState, ChangeEvent } from 'react';
import { PlatformConfig, PaymentPlatform } from '../../types/payment';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2 } from 'lucide-react';

interface PaymentPlatformSettingsProps {
  platform: PaymentPlatform;
  onSave: (config: PlatformConfig) => void;
  onCancel: () => void;
}

export function PaymentPlatformSettings({ platform, onSave, onCancel }: PaymentPlatformSettingsProps) {
  const [settings, setSettings] = useState<PlatformConfig['settings']>({
    id: '',
    name: platform,
    platform: platform,
    logo: '',
    description: '',
    settings: {
      webhook: {
        url: '',
        secret: ''
      },
      apiKey: '',
      secretKey: '',
      sandbox: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const config: PlatformConfig = {
        platform_id: settings.id,
        platform_type: platform,
        settings
      };

      await onSave(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSettingsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [id]: value
      }
    }));
  };

  const handleWebhookChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        webhook: {
          ...prev.settings.webhook,
          [id]: value
        }
      }
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure {platform}</CardTitle>
        <CardDescription>
          Configure the settings for the {platform} payment platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="id">Platform ID</Label>
            <Input
              id="id"
              value={settings.id}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={settings.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={settings.logo}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={settings.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              value={settings.settings.webhook.url}
              onChange={handleWebhookChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret">Webhook Secret</Label>
            <Input
              id="secret"
              type="password"
              value={settings.settings.webhook.secret}
              onChange={handleWebhookChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.settings.apiKey}
              onChange={handleSettingsChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Key</Label>
            <Input
              id="secretKey"
              type="password"
              value={settings.settings.secretKey}
              onChange={handleSettingsChange}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="sandbox"
              checked={settings.settings.sandbox}
              onCheckedChange={(checked) =>
                setSettings(prev => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    sandbox: checked
                  }
                }))
              }
            />
            <Label htmlFor="sandbox">Sandbox Mode</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 