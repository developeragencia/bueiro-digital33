import { supabase } from '../../lib/supabase';
import {
  PaymentPlatform,
  PaymentPlatformType,
  PlatformSettings,
  PlatformStatusData,
  Transaction,
  PlatformConfig,
  PlatformIntegration
} from '../../types/payment';
import { Database } from '../../types/supabase';
import { KiwifyService } from './platforms/KiwifyService';
import { ClickBankService } from './platforms/ClickBankService';
import { AppmaxService } from './platforms/AppmaxService';
import { CartPandaService } from './platforms/CartPandaService';
import { Digistore24Service } from './platforms/Digistore24Service';
import { DoppusService } from './platforms/DoppusService';
import { FortPayService } from './platforms/FortPayService';
import { FRCService } from './platforms/FRCService';
import { BasePlatformService } from './platforms/BasePlatformService';

type PaymentPlatformRow = Database['public']['Tables']['payment_platforms']['Row'];

export class PaymentPlatformService {
  private platforms: Map<string, BasePlatformService>;

  constructor() {
    this.platforms = new Map();
  }

  private initializePlatform(platform: PaymentPlatform) {
    if (!this.platforms.has(platform.id)) {
      const config: PlatformConfig = {
        platformId: platform.id,
        name: platform.name,
        apiKey: platform.settings.apiKey,
        secretKey: platform.settings.secretKey,
        sandbox: platform.settings.sandbox,
        settings: platform.settings
      };

      switch (platform.type) {
        case 'kiwify':
          this.platforms.set(platform.id, new KiwifyService(config));
          break;
        case 'clickbank':
          this.platforms.set(platform.id, new ClickBankService(config));
          break;
        case 'appmax':
          this.platforms.set(platform.id, new AppmaxService(config));
          break;
        case 'cartpanda':
          this.platforms.set(platform.id, new CartPandaService(config));
          break;
        case 'digistore24':
          this.platforms.set(platform.id, new Digistore24Service(config));
          break;
        case 'doppus':
          this.platforms.set(platform.id, new DoppusService(config));
          break;
        case 'fortpay':
          this.platforms.set(platform.id, new FortPayService(config));
          break;
        case 'frc':
          this.platforms.set(platform.id, new FRCService(config));
          break;
        default:
          throw new Error(`Platform type ${platform.type} not supported`);
      }
    }
  }

  async processPayment(platform: PaymentPlatform, data: Record<string, any>): Promise<Transaction> {
    this.initializePlatform(platform);
    const service = this.platforms.get(platform.id);
    if (!service) throw new Error(`Platform ${platform.id} not initialized`);
    return service.processPayment(data);
  }

  async processRefund(platform: PaymentPlatform, transactionId: string, amount?: number, reason?: string): Promise<Transaction> {
    this.initializePlatform(platform);
    const service = this.platforms.get(platform.id);
    if (!service) throw new Error(`Platform ${platform.id} not initialized`);
    return service.processRefund(transactionId, amount, reason);
  }

  async validateWebhook(platform: PaymentPlatform, payload: Record<string, any>, signature: string): Promise<boolean> {
    this.initializePlatform(platform);
    const service = this.platforms.get(platform.id);
    if (!service) throw new Error(`Platform ${platform.id} not initialized`);
    return service.validateWebhook(payload, signature);
  }

  async getTransaction(platform: PaymentPlatform, transactionId: string): Promise<Transaction> {
    this.initializePlatform(platform);
    const service = this.platforms.get(platform.id);
    if (!service) throw new Error(`Platform ${platform.id} not initialized`);
    return service.getTransaction(transactionId);
  }

  async getTransactions(platform: PaymentPlatform, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    this.initializePlatform(platform);
    const service = this.platforms.get(platform.id);
    if (!service) throw new Error(`Platform ${platform.id} not initialized`);
    return service.getTransactions(startDate, endDate);
  }

  async getStatus(platform: PaymentPlatform): Promise<PlatformStatusData> {
    this.initializePlatform(platform);
    const service = this.platforms.get(platform.id);
    if (!service) throw new Error(`Platform ${platform.id} not initialized`);
    return service.getStatus();
  }

  getAvailablePlatforms(): PaymentPlatformType[] {
    return [
      'kiwify',
      'clickbank',
      'appmax',
      'cartpanda',
      'digistore24',
      'doppus',
      'fortpay',
      'frc'
    ];
  }

  async integrate(platform: PaymentPlatformType, config: PlatformConfig, userId: string): Promise<PlatformIntegration> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .insert({
        name: config.name,
        type: platform,
        settings: config.settings,
        user_id: userId,
        active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<PaymentPlatform>): Promise<PaymentPlatform> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateConfig(platform: PaymentPlatform, config: PlatformConfig): Promise<void> {
    this.initializePlatform(platform);
    const service = this.platforms.get(platform.id);
    if (!service) throw new Error(`Platform ${platform.id} not initialized`);
    await service.updateConfig(config);
  }

  async toggleActive(id: string): Promise<PaymentPlatform> {
    const platform = await this.getById(id);
    if (!platform) throw new Error(`Platform ${id} not found`);
    return this.update(id, { active: !platform.active });
  }

  async getById(id: string): Promise<PaymentPlatform | null> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getByUserId(userId: string): Promise<PaymentPlatform[]> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .select()
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payment_platforms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

export const paymentPlatformService = new PaymentPlatformService();
 