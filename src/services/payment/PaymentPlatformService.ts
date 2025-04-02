import { supabase } from '../../lib/supabase';
import { PaymentPlatform } from '../../types/supabase';
import { AvailablePlatform, PlatformConfig, PlatformIntegration, PlatformSettings, PlatformStatus } from '../../types/payment';

class PaymentPlatformService {
  async create(platform: Omit<PaymentPlatform, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('payment_platforms')
        .insert([platform])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment platform:', error);
      throw error;
    }
  }

  async update(id: string, platform: Partial<PaymentPlatform>) {
    try {
      const { data, error } = await supabase
        .from('payment_platforms')
        .update(platform)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment platform:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('payment_platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting payment platform:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('payment_platforms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting payment platform:', error);
      throw error;
    }
  }

  async getByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_platforms')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user payment platforms:', error);
      throw error;
    }
  }

  async validateApiKey(apiKey: string) {
    try {
      const { data, error } = await supabase
        .from('payment_platforms')
        .select('*')
        .eq('api_key', apiKey)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error validating API key:', error);
      throw error;
    }
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
      features: {
        webhooks: true,
        refunds: true,
        subscriptions: true,
        splitPayments: false,
        customerManagement: true,
        productCatalog: true,
        orderManagement: true,
        reporting: true
      },
      supportedCurrencies: ['BRL', 'USD'],
      supportedPaymentMethods: ['credit_card', 'pix', 'boleto'],
      supportedCountries: ['BR', 'US'],
      testMode: false
    };
  }

  getDefaultPlatformStatus(): PlatformStatus {
    return {
      isActive: true,
      lastChecked: new Date(),
      uptime: 100,
      latency: 0,
      errors: 0
    };
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

    await this.create({
      user_id: userId,
      platform_id: platform.id,
      name: platform.name,
      description: platform.description,
      api_key: config.apiKey,
      secret_key: config.secretKey,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      webhook_url: config.webhookUrl,
      webhook_secret: config.webhookSecret,
      is_active: true
    });

    return integration;
  }
}

export const paymentPlatformService = new PaymentPlatformService();
 