import { PlatformConfig, Transaction, PlatformStatusData, Currency, PaymentMethod } from '../../types/payment';
import { supabase } from '../../lib/supabase';
import { getPlatformService } from './platforms';

export class PaymentPlatformService {
  private table = 'payment_platforms';

  async listPlatforms(): Promise<PlatformConfig[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*');

    if (error) throw new Error(`Failed to list platforms: ${error.message}`);
    return data || [];
  }

  async getPlatform(platformId: string): Promise<PlatformConfig | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('platform_id', platformId)
      .single();

    if (error) throw new Error(`Failed to get platform: ${error.message}`);
    return data;
  }

  async createPlatform(platform: PlatformConfig): Promise<PlatformConfig> {
    const { data, error } = await supabase
      .from(this.table)
      .insert([platform])
      .select()
      .single();

    if (error) throw new Error(`Failed to create platform: ${error.message}`);
    return data;
  }

  async updatePlatform(platformId: string, platform: Partial<PlatformConfig>): Promise<PlatformConfig> {
    const { data, error } = await supabase
      .from(this.table)
      .update(platform)
      .eq('platform_id', platformId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update platform: ${error.message}`);
    return data;
  }

  async deletePlatform(platformId: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('platform_id', platformId);

    if (error) throw new Error(`Failed to delete platform: ${error.message}`);
  }

  async processPayment(
    platform: PlatformConfig,
    paymentData: Record<string, any>,
    currency: Currency,
    paymentMethod: PaymentMethod,
    amount: number
  ): Promise<Transaction> {
    const service = getPlatformService(platform.type, platform);
    return service.processPayment(amount, currency, paymentMethod, paymentData);
  }

  async refundTransaction(
    platform: PlatformConfig,
    transactionId: string,
    amount?: number
  ): Promise<Transaction> {
    const service = getPlatformService(platform.type, platform);
    return service.refundTransaction(transactionId, amount);
  }

  async getTransaction(
    platform: PlatformConfig,
    transactionId: string
  ): Promise<Transaction> {
    const service = getPlatformService(platform.type, platform);
    return service.getTransaction(transactionId);
  }

  async getTransactions(
    platform: PlatformConfig,
    startDate?: Date,
    endDate?: Date
  ): Promise<Transaction[]> {
    const service = getPlatformService(platform.type, platform);
    return service.getTransactions(startDate, endDate);
  }

  async getStatus(platform: PlatformConfig): Promise<PlatformStatusData> {
    const service = getPlatformService(platform.type, platform);
    return service.getStatus();
  }

  async cancelTransaction(
    platform: PlatformConfig,
    transactionId: string
  ): Promise<Transaction> {
    const service = getPlatformService(platform.type, platform);
    return service.cancelTransaction(transactionId);
  }

  async validateWebhookSignature(
    platform: PlatformConfig,
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    const service = getPlatformService(platform.type, platform);
    return service.validateWebhookSignature(signature, payload);
  }
}
 