import { useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import { Database } from '../types/supabase';
import { useLoading } from './useLoading';
import { useNotification } from './useNotification';

type User = Database['public']['Tables']['users']['Row'];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const notification = useNotification();

  const [signIn, isSigningIn] = useLoading(AuthService.signIn);
  const [signUp, isSigningUp] = useLoading(AuthService.signUp);
  const [signOut, isSigningOut] = useLoading(AuthService.signOut);
  const [updateProfile, isUpdating] = useLoading(AuthService.updateProfile);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await AuthService.getSession();
        if (session?.user) {
          setUser(session.user as User);
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const { data: authListener } = AuthService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setUser(session?.user as User || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    notification.success('Login realizado com sucesso!');
    return result;
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await signUp(email, password, name);
    notification.success('Registro realizado com sucesso!');
    return result;
  };

  const logout = async () => {
    await signOut();
    notification.success('Logout realizado com sucesso!');
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user?.id) return;
    const result = await updateProfile(user.id, data);
    notification.success('Perfil atualizado com sucesso!');
    return result;
  };

  return {
    user,
    isInitialized,
    isSigningIn,
    isSigningUp,
    isSigningOut,
    isUpdating,
    login,
    register,
    logout,
    updateUserProfile,
  };
} 