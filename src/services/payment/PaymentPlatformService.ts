import { supabase } from '../../config/supabase';
import type { PaymentPlatform } from '../../config/supabase';

export const paymentPlatformService = {
  async create(platform: Omit<PaymentPlatform, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('payment_platforms')
      .insert([platform])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, platform: Partial<PaymentPlatform>) {
    const { data, error } = await supabase
      .from('payment_platforms')
      .update(platform)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('payment_platforms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('payment_platforms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('payment_platforms')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async validateApiKey(platformId: string, apiKey: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('payment_platforms')
        .select('api_key')
        .eq('id', platformId)
        .single();

      return data?.api_key === apiKey;
    } catch (error) {
      console.error('Erro ao validar API key:', error);
      return false;
    }
  },

  async listAvailablePlatforms() {
    return [
      { id: 'shopify', name: 'Shopify' },
      { id: 'systeme', name: 'Systeme' },
      { id: 'strivpay', name: 'StrivPay' },
      { id: 'appmax', name: 'Appmax' },
      { id: 'pepper', name: 'Pepper' },
      { id: 'logzz', name: 'Logzz' },
      { id: 'maxweb', name: 'MaxWeb' },
      { id: 'digistore24', name: 'Digistore24' },
      { id: 'fortpay', name: 'FortPay' },
      { id: 'clickbank', name: 'ClickBank' },
      { id: 'cartpanda', name: 'CartPanda' },
      { id: 'doppus', name: 'Doppus' },
      { id: 'nitro', name: 'Nitro' },
      { id: 'mundpay', name: 'MundPay' },
      { id: 'pagtrust', name: 'PagTrust' },
      { id: 'hubla', name: 'Hubla' },
      { id: 'ticto', name: 'Ticto' },
      { id: 'kiwify', name: 'Kiwify' }
    ];
  }
};
 