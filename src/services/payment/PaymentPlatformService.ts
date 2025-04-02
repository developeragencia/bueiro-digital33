import { supabase } from '../../lib/supabase';
import { 
  PaymentPlatform, 
  PlatformSettings, 
  PlatformStatus,
  PaymentPlatformType,
  AvailablePlatform,
  Transaction
} from '../../types/payment';
import { Database } from '../../types/supabase';

type PaymentPlatformRow = Database['public']['Tables']['payment_platforms']['Row'];

class PaymentPlatformServiceClass {
  private table = 'payment_platforms';

  async create(data: Omit<PaymentPlatform, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentPlatform> {
    const { data: platform, error } = await supabase
      .from(this.table)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return platform;
  }

  async update(id: string, data: Partial<PaymentPlatform>): Promise<PaymentPlatform> {
    const { data: platform, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return platform;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getById(id: string): Promise<PaymentPlatform> {
    const { data: platform, error } = await supabase
      .from(this.table)
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return platform;
  }

  async getByUserId(userId: string): Promise<PaymentPlatform[]> {
    const { data: platforms, error } = await supabase
      .from(this.table)
      .select()
      .eq('user_id', userId);

    if (error) throw error;
    return platforms;
  }

  async getByPlatform(platform: PaymentPlatformType): Promise<PaymentPlatform[]> {
    const { data: platforms, error } = await supabase
      .from(this.table)
      .select()
      .eq('platform', platform);

    if (error) throw error;
    return platforms;
  }

  async toggleActive(id: string): Promise<PaymentPlatform> {
    const platform = await this.getById(id);
    return this.update(id, { is_active: !platform.is_active });
  }

  async updateSettings(id: string, settings: PlatformSettings): Promise<PaymentPlatform> {
    return this.update(id, {
      client_id: settings.client_id,
      client_secret: settings.client_secret,
      webhook_url: settings.webhook_url,
      webhook_secret: settings.webhook_secret
    });
  }

  async getTransactions(platformId: string): Promise<Transaction[]> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select()
      .eq('platform_id', platformId);

    if (error) throw error;
    return transactions;
  }

  listAvailablePlatforms(): AvailablePlatform[] {
    return [
      {
        id: 'appmax',
        name: 'Appmax',
        description: 'Plataforma de pagamentos Appmax',
        logo: '/platforms/appmax.png'
      },
      {
        id: 'cartpanda',
        name: 'CartPanda',
        description: 'Plataforma de pagamentos CartPanda',
        logo: '/platforms/cartpanda.png'
      },
      {
        id: 'clickbank',
        name: 'ClickBank',
        description: 'Plataforma de pagamentos ClickBank',
        logo: '/platforms/clickbank.png'
      },
      {
        id: 'digistore24',
        name: 'Digistore24',
        description: 'Plataforma de pagamentos Digistore24',
        logo: '/platforms/digistore24.png'
      },
      {
        id: 'doppus',
        name: 'Doppus',
        description: 'Plataforma de pagamentos Doppus',
        logo: '/platforms/doppus.png'
      },
      {
        id: 'fortpay',
        name: 'FortPay',
        description: 'Plataforma de pagamentos FortPay',
        logo: '/platforms/fortpay.png'
      },
      {
        id: 'frc',
        name: 'FRC',
        description: 'Plataforma de pagamentos FRC',
        logo: '/platforms/frc.png'
      },
      {
        id: 'hubla',
        name: 'Hubla',
        description: 'Plataforma de pagamentos Hubla',
        logo: '/platforms/hubla.png'
      },
      {
        id: 'kiwify',
        name: 'Kiwify',
        description: 'Plataforma de pagamentos Kiwify',
        logo: '/platforms/kiwify.png'
      },
      {
        id: 'logzz',
        name: 'Logzz',
        description: 'Plataforma de pagamentos Logzz',
        logo: '/platforms/logzz.png'
      },
      {
        id: 'maxweb',
        name: 'MaxWeb',
        description: 'Plataforma de pagamentos MaxWeb',
        logo: '/platforms/maxweb.png'
      },
      {
        id: 'mundpay',
        name: 'MundPay',
        description: 'Plataforma de pagamentos MundPay',
        logo: '/platforms/mundpay.png'
      },
      {
        id: 'nitro',
        name: 'Nitro',
        description: 'Plataforma de pagamentos Nitro',
        logo: '/platforms/nitro.png'
      },
      {
        id: 'pagtrust',
        name: 'PagTrust',
        description: 'Plataforma de pagamentos PagTrust',
        logo: '/platforms/pagtrust.png'
      },
      {
        id: 'pepper',
        name: 'Pepper',
        description: 'Plataforma de pagamentos Pepper',
        logo: '/platforms/pepper.png'
      },
      {
        id: 'shopify',
        name: 'Shopify',
        description: 'Plataforma de pagamentos Shopify',
        logo: '/platforms/shopify.png'
      },
      {
        id: 'strivpay',
        name: 'StrivPay',
        description: 'Plataforma de pagamentos StrivPay',
        logo: '/platforms/strivpay.png'
      },
      {
        id: 'systeme',
        name: 'Systeme',
        description: 'Plataforma de pagamentos Systeme',
        logo: '/platforms/systeme.png'
      },
      {
        id: 'ticto',
        name: 'Ticto',
        description: 'Plataforma de pagamentos Ticto',
        logo: '/platforms/ticto.png'
      }
    ];
  }

  getDefaultPlatformSettings(): PlatformSettings {
    return {
      client_id: '',
      client_secret: '',
      webhook_url: '',
      webhook_secret: ''
    };
  }

  getDefaultPlatformStatus(): PlatformStatus {
    return 'active';
  }

  async createPlatformIntegration(
    userId: string,
    platform: AvailablePlatform,
    config: PlatformConfig
  ): Promise<PlatformIntegration> {
    const settings = this.getDefaultPlatformSettings();
    const status = this.getDefaultPlatformStatus();

    const integration: PlatformIntegration = {
      platform,
      config,
      settings,
      status
    };

    const platformToCreate: Omit<PaymentPlatform, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      platform_id: platform.id,
      name: platform.name,
      api_key: config.apiKey || '',
      secret_key: config.secretKey || '',
      client_id: config.clientId || null,
      client_secret: config.clientSecret || null,
      webhook_url: config.webhookUrl || null,
      webhook_secret: config.webhookSecret || null,
      settings: this.getDefaultPlatformSettings(),
      status: this.getDefaultPlatformStatus()
    };

    await this.create(platformToCreate);

    return integration;
  }

  async getPlatforms(): Promise<PaymentPlatform[]> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }
}

export const PaymentPlatformService = new PaymentPlatformServiceClass();
 