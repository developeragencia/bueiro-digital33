import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key são necessários');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Tipos para uso nos serviços
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export type User = Tables<'users'>;
export type UserPreferences = Tables<'user_preferences'>;
export type Campaign = Tables<'campaigns'>;
export type UTM = Tables<'utms'>;
export type Analytics = Tables<'analytics'>;
export type PaymentPlatform = Tables<'payment_platforms'>; 