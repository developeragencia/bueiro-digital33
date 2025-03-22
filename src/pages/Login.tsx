import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      await login(email.trim(), password.trim());
    } catch (err) {
      setError('Email ou senha inválidos');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'admin' | 'user') => {
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const credentials = type === 'admin' 
        ? { email: 'admin@example.com', password: 'admin' }
        : { email: 'user@example.com', password: 'user' };
      
      await login(credentials.email, credentials.password);
    } catch (err) {
      setError('Erro ao fazer login com conta demo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[100%] opacity-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                backgroundColor: `rgba(${Math.random() * 100 + 155}, ${
                  Math.random() * 100 + 155
                }, 255, 0.5)`,
                borderRadius: '50%',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Link 
          to="/" 
          className="absolute top-8 left-8 flex items-center text-gray-600 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="relative">
            Voltar para Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full" />
          </span>
        </Link>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex flex-col items-center">
            <div className="transform hover:scale-110 transition-transform duration-300">
              <Logo />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Faça login na sua conta para continuar
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-xl rounded-xl border border-gray-100 sm:px-10 transform transition-all duration-300 hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail 
                      className={`h-5 w-5 transition-colors duration-300 ${
                        focusedField === 'email' ? 'text-blue-500' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 sm:text-sm"
                    placeholder="seu@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock 
                      className={`h-5 w-5 transition-colors duration-300 ${
                        focusedField === 'password' ? 'text-blue-500' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 sm:text-sm"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed group"
              >
                <span className="flex items-center">
                  {isLoading ? 'Entrando...' : (
                    <>
                      Entrar
                      <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Não tem uma conta?
                  </span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Cadastre-se gratuitamente
                </Link>
              </div>

              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Credenciais de teste
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={isLoading}
                  className="bg-gray-50/80 backdrop-blur p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md text-left disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <p className="font-semibold text-gray-900">Admin:</p>
                  <p>admin@example.com</p>
                  <p>senha: admin</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('user')}
                  disabled={isLoading}
                  className="bg-gray-50/80 backdrop-blur p-3 rounded-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-md text-left disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <p className="font-semibold text-gray-900">Usuário:</p>
                  <p>user@example.com</p>
                  <p>senha: user</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}