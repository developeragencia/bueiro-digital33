import { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Database } from '../types/supabase';

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'USER_DELETED';

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      throw error as AuthError;
    }
  }

  static async signUp(email: string, password: string, name: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ id: authData.user.id, name, email }]);

        if (profileError) throw profileError;
      }

      return authData;
    } catch (error) {
      throw error as AuthError;
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error as AuthError;
    }
  }

  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      throw error as AuthError;
    }
  }

  static onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event as AuthChangeEvent, session);
    });
  }

  static async updateProfile(userId: string, data: Partial<Database['public']['Tables']['users']['Update']>) {
    try {
      const { data: updatedData, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    } catch (error) {
      throw error as AuthError;
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      throw error as AuthError;
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (error) {
      throw error as AuthError;
    }
  }
} 