import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key are required');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  db: {
    schema: 'public'
  }
});

// Adiciona um interceptor para logar erros
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    logger.info('User signed out');
  } else if (event === 'SIGNED_IN') {
    logger.info('User signed in');
  } else if (event === 'TOKEN_REFRESHED') {
    logger.info('Token refreshed');
  }
});

// Adiciona um método para verificar a conexão
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('transactions').select('count').single();
    if (error) throw error;
    return true;
  } catch (error) {
    logger.error('Failed to connect to Supabase', { error });
    return false;
  }
};

// Adiciona um método para executar queries com retry
export const executeQueryWithRetry = async <T>(
  query: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data, error } = await query();
      if (error) throw error;
      if (!data) throw new Error('No data returned');
      return data;
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

// Adiciona um método para inserir dados com validação
export const insertWithValidation = async <T>(
  table: string,
  data: Partial<T>,
  validateFn: (data: Partial<T>) => boolean
): Promise<T> => {
  if (!validateFn(data)) {
    throw new Error('Invalid data');
  }

  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  if (!result) throw new Error('No data returned');

  return result;
};

// Adiciona um método para atualizar dados com validação
export const updateWithValidation = async <T>(
  table: string,
  id: string,
  data: Partial<T>,
  validateFn: (data: Partial<T>) => boolean
): Promise<T> => {
  if (!validateFn(data)) {
    throw new Error('Invalid data');
  }

  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  if (!result) throw new Error('No data returned');

  return result;
};

// Adiciona um método para deletar dados com validação
export const deleteWithValidation = async <T>(
  table: string,
  id: string,
  validateFn: (id: string) => boolean
): Promise<void> => {
  if (!validateFn(id)) {
    throw new Error('Invalid id');
  }

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Adiciona um método para buscar dados com paginação
export const fetchWithPagination = async <T>(
  table: string,
  page = 1,
  limit = 10,
  filters?: Record<string, any>
): Promise<{ data: T[]; total: number }> => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const query = supabase
    .from(table)
    .select('*', { count: 'exact' });

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query.eq(key, value);
    });
  }

  const { data, error, count } = await query
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) throw new Error('No data returned');

  return {
    data,
    total: count || 0
  };
};

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
}

// Helper functions for type-safe database operations
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function deleteProfile(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;
}