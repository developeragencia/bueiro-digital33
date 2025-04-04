import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const storedUser = localStorage.getItem('@BueiroDigital:user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO: Implementar chamada à API de login
      const response = {
        id: '1',
        name: 'Admin',
        email: email,
        role: 'admin' as const
      };

      setUser(response);
      localStorage.setItem('@BueiroDigital:user', JSON.stringify(response));
    } catch (error) {
      throw new Error('Erro ao fazer login');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // TODO: Implementar chamada à API de registro
      const response = {
        id: '1',
        name: name,
        email: email,
        role: 'user' as const
      };

      setUser(response);
      localStorage.setItem('@BueiroDigital:user', JSON.stringify(response));
    } catch (error) {
      throw new Error('Erro ao criar conta');
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('@BueiroDigital:user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}; 