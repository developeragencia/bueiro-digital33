import { supabase } from './supabase';

export interface IntegrationSettings {
  id: string;
  platform: string;
  settings: {
    webhookUrl?: string;
    secretToken?: string;
    secretKey?: string;
    [key: string]: any;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface IntegrationEvent {
  template: string;
}

interface BaseIntegrationConfig {
  name: string;
  webhookUrl: string;
  requiresId: boolean;
}

interface SecretKeyConfig extends BaseIntegrationConfig {
  requiresSecretKey: boolean;
}

interface EventsConfig extends BaseIntegrationConfig {
  events: Record<string, IntegrationEvent>;
}

type IntegrationConfig = BaseIntegrationConfig | SecretKeyConfig | EventsConfig;

export const INTEGRATION_CONFIGS: Record<string, IntegrationConfig> = {
  buygoods: {
    name: 'BuyGoods',
    webhookUrl: 'https://api.utmify.com.br/webhooks/buygoods',
    requiresId: true,
    events: {
      sale_approved: {
        template: '?orderId={ORDERID}&commission={COMMISSION_AMOUNT}&subId={SUBID}&subId2={SUBID2}&subId3={SUBID3}&subId4={SUBID4}&subId5={SUBID5}&email={EMAILHASH}&type={CONV_TYPE}&product={PRODUCT_CODENAME}&event=sale_approved'
      },
      sale_refunded: {
        template: '?orderId={ORDERID}&commission={COMMISSION_AMOUNT}&subId={SUBID}&subId2={SUBID2}&subId3={SUBID3}&subId4={SUBID4}&subId5={SUBID5}&email={EMAILHASH}&type={CONV_TYPE}&product={PRODUCT_CODENAME}&event=sale_refunded'
      }
    }
  },
  clickbank: {
    name: 'ClickBank',
    webhookUrl: 'https://api.utmify.com.br/webhooks/clickbank',
    requiresId: true,
    requiresSecretKey: true
  },
  kiwify: {
    name: 'Kiwify',
    webhookUrl: 'https://api.utmify.com.br/webhooks/kiwify',
    requiresId: true
  },
  perfectpay: {
    name: 'PerfectPay',
    webhookUrl: 'https://api.utmify.com.br/webhooks/perfectpay',
    requiresId: true
  },
  hotmart: {
    name: 'Hotmart',
    webhookUrl: 'https://api.utmify.com.br/webhooks/hotmart',
    requiresId: true,
    requiresSecretKey: true
  },
  eduzz: {
    name: 'Eduzz',
    webhookUrl: 'https://api.utmify.com.br/webhooks/eduzz',
    requiresId: true
  },
  braip: {
    name: 'Braip',
    webhookUrl: 'https://api.utmify.com.br/webhooks/braip',
    requiresId: true
  },
  monetizze: {
    name: 'Monetizze',
    webhookUrl: 'https://api.utmify.com.br/webhooks/monetizze',
    requiresId: true
  },
  yampi: {
    name: 'Yampi',
    webhookUrl: 'https://api.utmify.com.br/webhooks/yampi',
    requiresId: true
  },
  maxweb: {
    name: 'Maxweb',
    webhookUrl: 'https://api.utmify.com.br/webhooks/maxweb',
    requiresId: true
  },
  frendz: {
    name: 'Frendz',
    webhookUrl: 'https://api.utmify.com.br/webhooks/frendz',
    requiresId: true
  }
};

export async function saveIntegrationSettings(platform: string, settings: any) {
  try {
    const { data: existingSettings, error: fetchError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('platform', platform)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existingSettings) {
      const { data, error: updateError } = await supabase
        .from('integration_settings')
        .update({ settings })
        .eq('id', existingSettings.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    }

    const { data, error: insertError } = await supabase
      .from('integration_settings')
      .insert([{ platform, settings }])
      .select()
      .single();

    if (insertError) throw insertError;
    return data;
  } catch (error) {
    console.error('Error saving integration settings:', error);
    throw new Error('Failed to save integration settings');
  }
}

export async function getIntegrationSettings(platform: string) {
  try {
    const { data, error } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('platform', platform)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error getting integration settings:', error);
    return null;
  }
}

export function buildWebhookUrl(platform: string, id: string, event?: string) {
  const config = INTEGRATION_CONFIGS[platform as keyof typeof INTEGRATION_CONFIGS];
  if (!config) throw new Error(`Invalid platform: ${platform}`);

  let url = `${config.webhookUrl}?id=${id}`;

  if (event && 'events' in config && config.events?.[event]) {
    url = `${config.webhookUrl}${config.events[event].template}&id=${id}`;
  }

  return url;
}