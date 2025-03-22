import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Zap,
  LineChart,
  BarChart,
  Target,
  Share2,
  Globe2,
  CheckCircle,
  Star,
  ShoppingCart,
  CreditCard,
  ArrowDown,
  Users,
  TrendingUp,
  Shield,
  Laptop,
  CheckCircle2,
  ArrowUpRight,
  Infinity,
  Menu,
  X
} from 'lucide-react';
import Logo from '../components/Logo';

function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    const animationInterval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(animationInterval);
    };
  }, []);

  const heroTexts = [
    "Potencialize seus resultados",
    "Maximize seu ROI",
    "Otimize suas campanhas",
    "Alcance o sucesso"
  ];

  const highlights = [
    "Rastreamento em tempo real",
    "Integrações automáticas",
    "Relatórios personalizados",
    "Suporte 24/7"
  ];

  const integrations = [
    { name: "Hubla", logo: "https://ext.same-assets.com/127242217/2711258684.png" },
    { name: "PerfectPay", logo: "https://ext.same-assets.com/127242217/4183430041.png" },
    { name: "Monetizze", logo: "https://ext.same-assets.com/127242217/3591066482.png" },
    { name: "Eduzz", logo: "https://ext.same-assets.com/127242217/3848818458.png" },
    { name: "Doppus", logo: "https://ext.same-assets.com/127242217/1631708117.png" },
    { name: "TriboPay", logo: "https://ext.same-assets.com/127242217/1295413627.png" },
    { name: "Logzz", logo: "https://ext.same-assets.com/127242217/129399964.png" },
    { name: "OctusPay", logo: "https://ext.same-assets.com/127242217/119572359.png" },
    { name: "InovaPag", logo: "https://ext.same-assets.com/127242217/3035113711.png" },
    { name: "Greenn", logo: "https://ext.same-assets.com/127242217/4125013978.png" },
    { name: "WooCommerce", logo: "https://ext.same-assets.com/127242217/4048623955.png" },
    { name: "StrivPay", logo: "https://ext.same-assets.com/127242217/2276173766.png" },
    { name: "CinqPay", logo: "https://ext.same-assets.com/127242217/345271496.png" },
    { name: "Digistore", logo: "https://ext.same-assets.com/127242217/2658908938.png" },
    { name: "Kiwify", logo: "https://ext.same-assets.com/127242217/1799828963.png" }
  ];

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Rastreamento Preciso',
      description: 'Monitore cada clique e conversão com precisão absoluta.',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: 'Analytics Avançado',
      description: 'Tome decisões baseadas em dados em tempo real.',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      title: 'Automação Inteligente',
      description: 'Automatize suas campanhas com regras personalizadas.',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: 'Integração Universal',
      description: 'Conecte-se com todas as principais plataformas.',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      icon: <Globe2 className="h-6 w-6" />,
      title: 'Multi-plataforma',
      description: 'Gerencie campanhas em diferentes canais.',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Validação Automática',
      description: 'Garanta a precisão dos seus links UTM.',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  const stats = [
    { 
      value: '99.9%', 
      label: 'Uptime', 
      icon: <Zap className="h-5 w-5" />,
      gradient: 'from-purple-600 to-indigo-600'
    },
    { 
      value: '+500', 
      label: 'Clientes Ativos', 
      icon: <Star className="h-5 w-5" />,
      gradient: 'from-blue-600 to-cyan-600'
    },
    { 
      value: '+1M', 
      label: 'UTMs Gerados', 
      icon: <ShoppingCart className="h-5 w-5" />,
      gradient: 'from-emerald-600 to-green-600'
    },
    { 
      value: '+50M', 
      label: 'Clicks Rastreados', 
      icon: <CreditCard className="h-5 w-5" />,
      gradient: 'from-rose-600 to-pink-600'
    }
  ];

  const testimonials = [
    {
      name: "João Silva",
      role: "Marketing Manager",
      company: "TechCorp",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: "Desde que começamos a usar o Bueiro Digital, nossa eficiência em rastreamento de campanhas aumentou em 300%. É uma ferramenta indispensável."
    },
    {
      name: "Maria Santos",
      role: "Digital Strategist",
      company: "Growth Agency",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: "A facilidade de uso e a precisão dos dados nos ajudaram a otimizar nossas campanhas de maneira extraordinária."
    },
    {
      name: "Pedro Costa",
      role: "CEO",
      company: "Digital Solutions",
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      content: "O suporte é excepcional e as integrações são perfeitas. Recomendo fortemente para qualquer empresa séria."
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Aumente seu ROI",
      description: "Otimize suas campanhas com dados precisos e tome decisões mais inteligentes."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Dados Seguros",
      description: "Seus dados estão protegidos com a mais alta tecnologia de segurança."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Colaboração em Equipe",
      description: "Trabalhe em conjunto com sua equipe de forma eficiente e organizada."
    },
    {
      icon: <Laptop className="h-6 w-6" />,
      title: "Fácil de Usar",
      description: "Interface intuitiva que não requer conhecimento técnico avançado."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#integrations" 
                className="text-gray-600 hover:text-gray-900 transition-all duration-300 relative group"
              >
                Integrações
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 group-hover:w-full" />
              </a>
              <a 
                href="#features" 
                className="text-gray-600 hover:text-gray-900 transition-all duration-300 relative group"
              >
                Recursos
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 group-hover:w-full" />
              </a>
              <Link
                to="/login"
                className="group relative inline-flex items-center px-6 py-2.5 rounded-lg text-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 group-hover:scale-110" />
                <span className="relative flex items-center font-medium">
                  Entrar na plataforma
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a 
                href="#integrations" 
                className="block text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Integrações
              </a>
              <a 
                href="#features" 
                className="block text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Recursos
              </a>
              <Link
                to="/login"
                className="block w-full text-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entrar na plataforma
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-100/40 via-white to-blue-100/40" />
          
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  backgroundColor: `rgba(${Math.random() * 100 + 155}, ${
                    Math.random() * 100 + 155
                  }, 255, ${Math.random() * 0.3 + 0.1})`,
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`,
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Pre-headline badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-600 mb-8">
              <Infinity className="h-4 w-4 mr-2 animate-spin-slow" />
              Descubra o poder do rastreamento inteligente
            </div>

            {/* Animated headline */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
                {heroTexts[animationStep]}
              </span>
              <br />
              <span className="mt-4 block text-4xl md:text-6xl text-gray-900">
                com precisão e estratégia
              </span>
            </h1>

            <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto">
              Transforme dados em resultados extraordinários com nossa plataforma 
              completa de gestão e otimização de campanhas digitais.
            </p>

            {/* Highlights */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {highlights.map((highlight, index) => (
                <div
                  key={highlight}
                  className="flex items-center space-x-2 text-gray-700"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="mt-12 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="relative inline-flex items-center px-8 py-3 rounded-lg text-white overflow-hidden transform transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600" />
                <span className="relative flex items-center font-medium">
                  Começar agora
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </span>
              </Link>
              <a 
                href="#features"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-300"
              >
                <span>Saiba mais</span>
                <ArrowDown className="ml-2 h-5 w-5 animate-bounce" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="integrations" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Integrações Disponíveis
            </h2>
            <p className="mt-4 text-gray-600">
              Conecte-se com suas plataformas favoritas
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 flex items-center justify-center">
                  <img
                    src={integration.logo}
                    alt={`${integration.name} logo`}
                    className="h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/logos/placeholder.svg';
                    }}
                  />
                </div>
                <p className="mt-2 text-sm text-center font-medium text-gray-900">{integration.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Recursos Poderosos
            </h2>
            <p className="mt-4 text-gray-600">
              Tudo que você precisa para o sucesso das suas campanhas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white w-12 h-12 flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white w-12 h-12 flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              O que nossos clientes dizem
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">{testimonial.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white w-12 h-12 flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-8">
              <Logo />
              <nav className="flex space-x-6">
                <a href="#integrations" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Integrações
                </a>
                <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Recursos
                </a>
                <Link to="/login" className="text-gray-500 hover:text-gray-900 transition-colors">
                  Login
                </Link>
              </nav>
            </div>
            <div className="mt-6 md:mt-0">
              <p className="text-sm text-gray-500">
                © 2025 Bueiro Digital. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;