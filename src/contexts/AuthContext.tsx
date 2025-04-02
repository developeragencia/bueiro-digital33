import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isInitialized: boolean;
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningOut: boolean;
  isUpdating: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(profile);
      } else {
        setUser(null);
      }
      setIsInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsSigningIn(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } finally {
      setIsSigningIn(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsSigningUp(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          email,
        });
      }

      return data;
    } finally {
      setIsSigningUp(false);
    }
  };

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      setIsSigningOut(false);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id);
      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...data } : null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitialized,
        isSigningIn,
        isSigningUp,
        isSigningOut,
        isUpdating,
        login,
        register,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}