import { supabase } from './supabase';
import { Database } from '../types/supabase';

type PaymentPlatform = Database['public']['Tables']['payment_platforms']['Row'];
type PaymentPlatformInsert = Database['public']['Tables']['payment_platforms']['Insert'];
type PaymentPlatformUpdate = Database['public']['Tables']['payment_platforms']['Update'];

export class PaymentPlatformService {
  static async list(userId: string): Promise<PaymentPlatform[]> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async get(id: string, userId: string): Promise<PaymentPlatform> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async create(platform: PaymentPlatformInsert): Promise<PaymentPlatform> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .insert([platform])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async update(
    id: string,
    platform: PaymentPlatformUpdate
  ): Promise<PaymentPlatform> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .update(platform)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  static async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_platforms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  static async toggleActive(
    id: string,
    userId: string,
    isActive: boolean
  ): Promise<PaymentPlatform> {
    const { data, error } = await supabase
      .from('payment_platforms')
      .update({ is_active: isActive })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
} 