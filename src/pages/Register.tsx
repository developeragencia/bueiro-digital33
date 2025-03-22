import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register(name.trim(), email.trim(), password.trim());
    } catch (err) {
      setError('Erro ao criar conta. Verifique os dados e tente novamente.');
      setPassword('');
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
          to="/login" 
          className="absolute top-8 left-8 flex items-center text-gray-600 hover:text-gray-900 transition-all duration-300 transform hover:scale-105 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          <span className="relative">
            Voltar para Login
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-full" />
          </span>
        </Link>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex flex-col items-center">
            <div className="transform hover:scale-110 transition-transform duration-300">
              <Logo />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Crie sua conta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Comece a otimizar suas campanhas agora mesmo
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-xl rounded-xl border border-gray-100 sm:px-10 transform transition-all duration-300 hover:shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700 animate-shake">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 animate-pulse" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <div className="mt-1 relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User 
                      className={`h-5 w-5 transition-colors duration-300 ${
                        focusedField === 'name' ? 'text-blue-500' : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 sm:text-sm"
                    placeholder="Seu nome completo"
                    required
                    autoFocus
                  />
                </div>
              </div>

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
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !name.trim() || !email.trim() || !password.trim()}
                  className="relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-75 disabled:cursor-not-allowed group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shine" />
                  <span className="relative flex items-center">
                    {isLoading ? (
                      'Criando conta...'
                    ) : (
                      <>
                        Criar conta gratuita
                        <Sparkles className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}