import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS = {
  admin: {
    email: 'admin@example.com',
    password: 'admin',
    userData: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin' as const
    }
  },
  user: {
    email: 'user@example.com',
    password: 'user',
    userData: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Regular User',
      email: 'user@example.com',
      role: 'user' as const
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Error saving user to localStorage:', error);
      }
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Check demo credentials first
      const demoAdmin = DEMO_USERS.admin;
      const demoUser = DEMO_USERS.user;

      if (email === demoAdmin.email && password === demoAdmin.password) {
        setUser(demoAdmin.userData);
        toast.success('Login realizado com sucesso!');
        return;
      }
      
      if (email === demoUser.email && password === demoUser.password) {
        setUser(demoUser.userData);
        toast.success('Login realizado com sucesso!');
        return;
      }

      // If not demo user, try Supabase auth
      const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      if (!authUser) throw new Error('No user returned after login');

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('No profile found');

      const userData: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role
      };

      setUser(userData);
      toast.success('Login realizado com sucesso!');

    } catch (error) {
      console.error('Login error:', error);
      toast.error('Email ou senha inválidos');
      throw new Error('Invalid credentials');
    }
  }, [toast]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user'
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authUser) throw new Error('No user returned after registration');

      // Wait for profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch the created profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('No profile found');

      const userData: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role
      };

      setUser(userData);
      toast.success('Conta criada com sucesso!');

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erro ao criar conta. Tente novamente.');
      throw new Error('Error creating account');
    }
  }, [toast]);

  const updateProfile = useCallback(async (data: { name: string; email: string }) => {
    if (!user) throw new Error('No user logged in');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          email: data.email
        })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...data } : null);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Erro ao atualizar perfil');
      throw error;
    }
  }, [user, toast]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('user');
      navigate('/', { replace: true });
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
      throw new Error('Error during logout');
    }
  }, [navigate, toast]);

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}