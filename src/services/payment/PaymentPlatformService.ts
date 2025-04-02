import { supabase } from '../../lib/supabase';
import {
  PaymentPlatform,
  PaymentPlatformType,
  PlatformSettings,
  PlatformStatusData,
  Transaction,
  AvailablePlatform,
  PlatformConfig,
  PlatformIntegration
} from '../../types/payment';
import { Database } from '../../types/supabase';

type PaymentPlatformRow = Database['public']['Tables']['payment_platforms']['Row'];

export class PaymentPlatformServiceClass {
  private table = 'payment_platforms';
  private integrationsTable = 'platform_integrations';

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
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return platform;
  }

  async getByUserId(userId: string): Promise<PaymentPlatform[]> {
    const { data: platforms, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return platforms;
  }

  async getByPlatform(platform: PaymentPlatformType): Promise<PaymentPlatform[]> {
    const { data: platforms, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('platform', platform);

    if (error) throw error;
    return platforms;
  }

  async toggleActive(id: string): Promise<PaymentPlatform> {
    const platform = await this.getById(id);
    return this.update(id, { is_active: !platform.is_active });
  }

  async updateSettings(id: string, settings: PlatformSettings): Promise<PaymentPlatform> {
    return this.update(id, { settings });
  }

  async getTransactions(platformId: string): Promise<Transaction[]> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('platform_id', platformId);

    if (error) throw error;
    return transactions;
  }

  getAvailablePlatforms(): AvailablePlatform[] {
    return [
      {
        id: 'appmax',
        name: 'Appmax',
        platform: 'appmax',
        logo: '/platforms/appmax.png',
        description: 'Plataforma de pagamentos Appmax'
      },
      {
        id: 'cartpanda',
        name: 'CartPanda',
        platform: 'cartpanda',
        logo: '/platforms/cartpanda.png',
        description: 'Plataforma de pagamentos CartPanda'
      },
      {
        id: 'clickbank',
        name: 'ClickBank',
        platform: 'clickbank',
        logo: '/platforms/clickbank.png',
        description: 'Plataforma de pagamentos ClickBank'
      },
      {
        id: 'digistore24',
        name: 'Digistore24',
        platform: 'digistore24',
        logo: '/platforms/digistore24.png',
        description: 'Plataforma de pagamentos Digistore24'
      },
      {
        id: 'doppus',
        name: 'Doppus',
        platform: 'doppus',
        logo: '/platforms/doppus.png',
        description: 'Plataforma de pagamentos Doppus'
      },
      {
        id: 'fortpay',
        name: 'FortPay',
        platform: 'fortpay',
        logo: '/platforms/fortpay.png',
        description: 'Plataforma de pagamentos FortPay'
      },
      {
        id: 'frc',
        name: 'FRC',
        platform: 'frc',
        logo: '/platforms/frc.png',
        description: 'Plataforma de pagamentos FRC'
      },
      {
        id: 'hubla',
        name: 'Hubla',
        platform: 'hubla',
        logo: '/platforms/hubla.png',
        description: 'Plataforma de pagamentos Hubla'
      },
      {
        id: 'kiwify',
        name: 'Kiwify',
        platform: 'kiwify',
        logo: '/platforms/kiwify.png',
        description: 'Plataforma de pagamentos Kiwify'
      },
      {
        id: 'logzz',
        name: 'Logzz',
        platform: 'logzz',
        logo: '/platforms/logzz.png',
        description: 'Plataforma de pagamentos Logzz'
      },
      {
        id: 'maxweb',
        name: 'MaxWeb',
        platform: 'maxweb',
        logo: '/platforms/maxweb.png',
        description: 'Plataforma de pagamentos MaxWeb'
      },
      {
        id: 'mundpay',
        name: 'MundPay',
        platform: 'mundpay',
        logo: '/platforms/mundpay.png',
        description: 'Plataforma de pagamentos MundPay'
      },
      {
        id: 'nitro',
        name: 'Nitro',
        platform: 'nitro',
        logo: '/platforms/nitro.png',
        description: 'Plataforma de pagamentos Nitro'
      },
      {
        id: 'pagtrust',
        name: 'PagTrust',
        platform: 'pagtrust',
        logo: '/platforms/pagtrust.png',
        description: 'Plataforma de pagamentos PagTrust'
      },
      {
        id: 'pepper',
        name: 'Pepper',
        platform: 'pepper',
        logo: '/platforms/pepper.png',
        description: 'Plataforma de pagamentos Pepper'
      },
      {
        id: 'shopify',
        name: 'Shopify',
        platform: 'shopify',
        logo: '/platforms/shopify.png',
        description: 'Plataforma de pagamentos Shopify'
      },
      {
        id: 'strivpay',
        name: 'StrivPay',
        platform: 'strivpay',
        logo: '/platforms/strivpay.png',
        description: 'Plataforma de pagamentos StrivPay'
      },
      {
        id: 'systeme',
        name: 'Systeme.io',
        platform: 'systeme',
        logo: '/platforms/systeme.png',
        description: 'Plataforma de pagamentos Systeme.io'
      },
      {
        id: 'ticto',
        name: 'Ticto',
        platform: 'ticto',
        logo: '/platforms/ticto.png',
        description: 'Plataforma de pagamentos Ticto'
      }
    ];
  }

  async getStatus(id: string): Promise<PlatformStatusData> {
    const { data: status, error } = await supabase
      .from('platform_status')
      .select('*')
      .eq('platform_id', id)
      .single();

    if (error) throw error;
    return status;
  }

  async integrate(
    platform: AvailablePlatform,
    config: PlatformConfig,
    userId: string
  ): Promise<PlatformIntegration> {
    const settings: PlatformSettings = {
      apiKey: config.apiKey,
      secretKey: config.secretKey,
      sandbox: config.sandbox || false,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    };

    const { data: integration, error } = await supabase
      .from('platform_integrations')
      .insert([{
        platform_id: platform.id,
        user_id: userId,
        settings,
        status: {
          is_active: true,
          last_checked: new Date().toISOString(),
          uptime: 100,
          latency: 0,
          errors: 0
        }
      }])
      .select()
      .single();

    if (error) throw error;
    return integration;
  }

  getDefaultPlatformSettings(): PlatformSettings {
      return {
      client_id: '',
      client_secret: '',
      webhook_url: '',
      webhook_secret: ''
    };
  }

  getDefaultPlatformStatus(): PlatformStatusData {
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

  async getAvailablePlatforms(): Promise<PaymentPlatform[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('active', true);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching available platforms:', error);
      throw error;
    }
  }

  async getById(platformId: string): Promise<PaymentPlatform | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', platformId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching platform by ID:', error);
      throw error;
    }
  }

  async getByUserId(userId: string): Promise<PaymentPlatform[]> {
    try {
      const { data: integrations, error: integrationsError } = await supabase
        .from(this.integrationsTable)
        .select('platform_id')
        .eq('user_id', userId);

      if (integrationsError) {
        throw integrationsError;
      }

      const platformIds = integrations.map(integration => integration.platform_id);

      const { data: platforms, error: platformsError } = await supabase
        .from(this.table)
        .select('*')
        .in('id', platformIds);

      if (platformsError) {
        throw platformsError;
      }

      return platforms;
    } catch (error) {
      console.error('Error fetching platforms by user ID:', error);
      throw error;
    }
  }

  async integrate(platform: PaymentPlatformType, config: PlatformConfig, userId: string): Promise<PaymentPlatform> {
    try {
      const { data: existingPlatform, error: platformError } = await supabase
        .from(this.table)
        .select('*')
        .eq('type', platform)
        .single();

      if (platformError) {
        throw platformError;
      }

      if (!existingPlatform) {
        throw new Error('Platform not found');
      }

      const integration: Omit<PlatformIntegration, 'id' | 'created_at' | 'updated_at'> = {
        platform_id: existingPlatform.id,
        user_id: userId,
        settings: config,
        status: {
          active: true,
          last_check: new Date().toISOString(),
          health: 'healthy',
          error: null
        }
      };

      const { data: newIntegration, error: integrationError } = await supabase
        .from(this.integrationsTable)
        .insert([integration])
        .select()
        .single();

      if (integrationError) {
        throw integrationError;
      }

      return {
        ...existingPlatform,
        settings: newIntegration.settings,
        status: newIntegration.status
      };
    } catch (error) {
      console.error('Error integrating platform:', error);
      throw error;
    }
  }

  async updateConfig(platformId: string, config: Partial<PlatformConfig>): Promise<PaymentPlatform> {
    try {
      const { data: existingPlatform, error: platformError } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', platformId)
        .single();

      if (platformError) {
        throw platformError;
      }

      if (!existingPlatform) {
        throw new Error('Platform not found');
      }

      const { data: updatedIntegration, error: integrationError } = await supabase
        .from(this.integrationsTable)
        .update({
          settings: { ...existingPlatform.settings, ...config }
        })
        .eq('platform_id', platformId)
        .select()
        .single();

      if (integrationError) {
        throw integrationError;
      }

      return {
        ...existingPlatform,
        settings: updatedIntegration.settings
      };
    } catch (error) {
      console.error('Error updating platform config:', error);
      throw error;
    }
  }

  async delete(platformId: string): Promise<void> {
    try {
      const { error: integrationError } = await supabase
        .from(this.integrationsTable)
        .delete()
        .eq('platform_id', platformId);

      if (integrationError) {
        throw integrationError;
      }

      const { error: platformError } = await supabase
        .from(this.table)
        .delete()
        .eq('id', platformId);

      if (platformError) {
        throw platformError;
      }
    } catch (error) {
      console.error('Error deleting platform:', error);
      throw error;
    }
  }

  async updateStatus(platformId: string, active: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .update({ active })
        .eq('id', platformId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating platform status:', error);
      throw error;
    }
  }

  async getIntegrationByPlatformId(platformId: string): Promise<PlatformIntegration | null> {
    try {
      const { data, error } = await supabase
        .from(this.integrationsTable)
        .select('*')
        .eq('platform_id', platformId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching integration by platform ID:', error);
      throw error;
    }
  }

  async getIntegrationsByUserId(userId: string): Promise<PlatformIntegration[]> {
    try {
      const { data, error } = await supabase
        .from(this.integrationsTable)
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching integrations by user ID:', error);
      throw error;
    }
  }

  async updateIntegrationStatus(platformId: string, status: PlatformIntegration['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.integrationsTable)
        .update({ status })
        .eq('platform_id', platformId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating integration status:', error);
      throw error;
    }
  }

  async deleteIntegration(platformId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.integrationsTable)
        .delete()
        .eq('platform_id', platformId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting integration:', error);
import { supabase } from '../../lib/supabase';
import {
  PaymentPlatform,
  PaymentPlatformType,
  PlatformSettings,
  PlatformStatusData,
  Transaction,
  AvailablePlatform,
  PlatformConfig,
  PlatformIntegration
} from '../../types/payment';
import { Database } from '../../types/supabase';

type PaymentPlatformRow = Database['public']['Tables']['payment_platforms']['Row'];

export class PaymentPlatformServiceClass {
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
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return platform;
  }

  async getByUserId(userId: string): Promise<PaymentPlatform[]> {
    const { data: platforms, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return platforms;
  }

  async getByPlatform(platform: PaymentPlatformType): Promise<PaymentPlatform[]> {
    const { data: platforms, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('platform', platform);

    if (error) throw error;
    return platforms;
  }

  async toggleActive(id: string): Promise<PaymentPlatform> {
    const platform = await this.getById(id);
    return this.update(id, { is_active: !platform.is_active });
  }

  async updateSettings(id: string, settings: PlatformSettings): Promise<PaymentPlatform> {
    return this.update(id, { settings });
  }

  async getTransactions(platformId: string): Promise<Transaction[]> {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('platform_id', platformId);

    if (error) throw error;
    return transactions;
  }

  getAvailablePlatforms(): AvailablePlatform[] {
    return [
      {
        id: 'appmax',
        name: 'Appmax',
        platform: 'appmax',
        logo: '/platforms/appmax.png',
        description: 'Plataforma de pagamentos Appmax'
      },
      {
        id: 'cartpanda',
        name: 'CartPanda',
        platform: 'cartpanda',
        logo: '/platforms/cartpanda.png',
        description: 'Plataforma de pagamentos CartPanda'
      },
      {
        id: 'clickbank',
        name: 'ClickBank',
        platform: 'clickbank',
        logo: '/platforms/clickbank.png',
        description: 'Plataforma de pagamentos ClickBank'
      },
      {
        id: 'digistore24',
        name: 'Digistore24',
        platform: 'digistore24',
        logo: '/platforms/digistore24.png',
        description: 'Plataforma de pagamentos Digistore24'
      },
      {
        id: 'doppus',
        name: 'Doppus',
        platform: 'doppus',
        logo: '/platforms/doppus.png',
        description: 'Plataforma de pagamentos Doppus'
      },
      {
        id: 'fortpay',
        name: 'FortPay',
        platform: 'fortpay',
        logo: '/platforms/fortpay.png',
        description: 'Plataforma de pagamentos FortPay'
      },
      {
        id: 'frc',
        name: 'FRC',
        platform: 'frc',
        logo: '/platforms/frc.png',
        description: 'Plataforma de pagamentos FRC'
      },
      {
        id: 'hubla',
        name: 'Hubla',
        platform: 'hubla',
        logo: '/platforms/hubla.png',
        description: 'Plataforma de pagamentos Hubla'
      },
      {
        id: 'kiwify',
        name: 'Kiwify',
        platform: 'kiwify',
        logo: '/platforms/kiwify.png',
        description: 'Plataforma de pagamentos Kiwify'
      },
      {
        id: 'logzz',
        name: 'Logzz',
        platform: 'logzz',
        logo: '/platforms/logzz.png',
        description: 'Plataforma de pagamentos Logzz'
      },
      {
        id: 'maxweb',
        name: 'MaxWeb',
        platform: 'maxweb',
        logo: '/platforms/maxweb.png',
        description: 'Plataforma de pagamentos MaxWeb'
      },
      {
        id: 'mundpay',
        name: 'MundPay',
        platform: 'mundpay',
        logo: '/platforms/mundpay.png',
        description: 'Plataforma de pagamentos MundPay'
      },
      {
        id: 'nitro',
        name: 'Nitro',
        platform: 'nitro',
        logo: '/platforms/nitro.png',
        description: 'Plataforma de pagamentos Nitro'
      },
      {
        id: 'pagtrust',
        name: 'PagTrust',
        platform: 'pagtrust',
        logo: '/platforms/pagtrust.png',
        description: 'Plataforma de pagamentos PagTrust'
      },
      {
        id: 'pepper',
        name: 'Pepper',
        platform: 'pepper',
        logo: '/platforms/pepper.png',
        description: 'Plataforma de pagamentos Pepper'
      },
      {
        id: 'shopify',
        name: 'Shopify',
        platform: 'shopify',
        logo: '/platforms/shopify.png',
        description: 'Plataforma de pagamentos Shopify'
      },
      {
        id: 'strivpay',
        name: 'StrivPay',
        platform: 'strivpay',
        logo: '/platforms/strivpay.png',
        description: 'Plataforma de pagamentos StrivPay'
      },
      {
        id: 'systeme',
        name: 'Systeme.io',
        platform: 'systeme',
        logo: '/platforms/systeme.png',
        description: 'Plataforma de pagamentos Systeme.io'
      },
      {
        id: 'ticto',
        name: 'Ticto',
        platform: 'ticto',
        logo: '/platforms/ticto.png',
        description: 'Plataforma de pagamentos Ticto'
      }
    ];
  }

  async getStatus(id: string): Promise<PlatformStatusData> {
    const { data: status, error } = await supabase
      .from('platform_status')
      .select('*')
      .eq('platform_id', id)
      .single();

    if (error) throw error;
    return status;
  }

  async integrate(
    platform: AvailablePlatform,
    config: PlatformConfig,
    userId: string
  ): Promise<PlatformIntegration> {
    const settings: PlatformSettings = {
      apiKey: config.apiKey,
      secretKey: config.secretKey,
      sandbox: config.sandbox || false,
      clientId: config.clientId,
      clientSecret: config.clientSecret
    };

    const { data: integration, error } = await supabase
      .from('platform_integrations')
      .insert([{
        platform_id: platform.id,
        user_id: userId,
        settings,
        status: {
          is_active: true,
          last_checked: new Date().toISOString(),
          uptime: 100,
          latency: 0,
          errors: 0
        }
      }])
      .select()
      .single();

    if (error) throw error;
    return integration;
  }

  getDefaultPlatformSettings(): PlatformSettings {
      return {
      client_id: '',
      client_secret: '',
      webhook_url: '',
      webhook_secret: ''
    };
  }

  getDefaultPlatformStatus(): PlatformStatusData {
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
 