import { supabase } from './supabase';

// Generic error handler
const handleError = (error: any) => {
  console.error('API Error:', error);
  throw new Error(error.message || 'An unexpected error occurred');
};

// Authentication
export const auth = {
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  signUp: async (email: string, password: string, metadata: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleError(error);
    }
  }
};

// Profiles
export const profiles = {
  get: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (userId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  }
};

// Dashboards
export const dashboards = {
  list: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  create: async (dashboard: any) => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .insert([dashboard])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  update: async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error);
    }
  }
};

// Integration Settings
export const integrations = {
  list: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('created_by', userId);
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  get: async (platform: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('*')
        .eq('platform', platform)
        .eq('created_by', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  save: async (settings: any) => {
    try {
      const { data, error } = await supabase
        .from('integration_settings')
        .upsert(settings)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('integration_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      handleError(error);
    }
  }
};