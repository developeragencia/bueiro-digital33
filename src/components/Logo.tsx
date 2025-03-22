import { type FC } from 'react';
import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

const Logo: FC<{ showLink?: boolean }> = ({ showLink = false }) => {
  const LogoContent = (
    <div className="flex items-center space-x-2 group">
      <div className="relative transform transition-all duration-500 hover:scale-110">
        <Rocket 
          size={32} 
          className="text-transparent transform transition-all duration-500 animate-float group-hover:rotate-12"
          style={{
            stroke: 'url(#rocket-gradient)',
            strokeWidth: 2
          }}
        />
        <svg width="0" height="0">
          <linearGradient id="rocket-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </svg>
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-8 bg-gradient-to-t from-orange-500 via-yellow-500 to-transparent rounded-full blur-sm animate-pulse transform scale-y-75 group-hover:scale-y-100 transition-transform" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
        Bueiro Digital
      </span>
    </div>
  );

  return showLink ? (
    <Link 
      to="/" 
      className="transition-transform duration-300 hover:scale-105"
      title="Voltar para Home"
    >
      {LogoContent}
    </Link>
  ) : (
    LogoContent
  );
};

export default Logo;