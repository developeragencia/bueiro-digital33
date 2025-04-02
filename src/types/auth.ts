export interface User {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
} 