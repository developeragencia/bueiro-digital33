import {
  ShoppingBag,
  DollarSign,
  Globe,
  ShoppingCart,
  Store,
  CreditCard,
  Building
} from 'lucide-react';

export interface Platform {
  id: string;
  name: string;
  description: string;
  category: 'E-commerce' | 'Pagamentos' | 'Marketplace' | 'Logística' | 'Marketing' | 'Plataforma' | 'Afiliados';
  logo: string;
  icon: any;
  color: string;
  fields: {
    name: string;
    type: 'text' | 'password' | 'email';
    label: string;
    placeholder: string;
    required: boolean;
  }[];
}

export const PLATFORMS: Platform[] = [
  {
    id: 'kiwify',
    name: 'Kiwify',
    description: 'Plataforma de produtos digitais e infoprodutos',
    category: 'E-commerce',
    logo: '/logos/kiwify.svg',
    icon: ShoppingBag,
    color: 'bg-purple-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'perfectpay',
    name: 'PerfectPay',
    description: 'Gateway de pagamentos e checkout',
    category: 'Pagamentos',
    logo: '/logos/perfect-pay.svg',
    icon: DollarSign,
    color: 'bg-green-600',
    fields: [
      {
        name: 'token',
        type: 'password',
        label: 'Token de Acesso',
        placeholder: 'Digite seu token de acesso',
        required: true
      }
    ]
  },
  {
    id: 'eduzz',
    name: 'Eduzz',
    description: 'Plataforma de produtos digitais',
    category: 'E-commerce',
    logo: '/logos/eduzz.svg',
    icon: Store,
    color: 'bg-blue-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'hotmart',
    name: 'Hotmart',
    description: 'Plataforma de produtos digitais',
    category: 'E-commerce',
    logo: '/logos/hotmart.svg',
    icon: ShoppingBag,
    color: 'bg-orange-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'monetizze',
    name: 'Monetizze',
    description: 'Plataforma de afiliados',
    category: 'Afiliados',
    logo: 'https://ext.same-assets.com/127242217/3591066482.png',
    icon: Building,
    color: 'bg-indigo-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'braip',
    name: 'Braip',
    description: 'Plataforma de produtos digitais',
    category: 'E-commerce',
    logo: 'https://ext.same-assets.com/127242217/2658908938.png',
    icon: Store,
    color: 'bg-purple-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'hubla',
    name: 'Hubla',
    description: 'Plataforma de gestão financeira',
    category: 'Pagamentos',
    logo: 'https://ext.same-assets.com/127242217/2711258684.png',
    icon: DollarSign,
    color: 'bg-blue-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'logzz',
    name: 'Logzz',
    description: 'Plataforma de logística',
    category: 'Logística',
    logo: 'https://ext.same-assets.com/127242217/129399964.png',
    icon: ShoppingCart,
    color: 'bg-indigo-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'inovapag',
    name: 'InovaPag',
    description: 'Gateway de pagamentos',
    category: 'Pagamentos',
    logo: 'https://ext.same-assets.com/127242217/3035113711.png',
    icon: CreditCard,
    color: 'bg-emerald-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'greenn',
    name: 'Greenn',
    description: 'Plataforma de pagamentos',
    category: 'Pagamentos',
    logo: 'https://ext.same-assets.com/127242217/4125013978.png',
    icon: CreditCard,
    color: 'bg-emerald-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Plataforma de e-commerce para WordPress',
    category: 'E-commerce',
    logo: 'https://ext.same-assets.com/127242217/4048623955.png',
    icon: Store,
    color: 'bg-purple-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  },
  {
    id: 'yampi',
    name: 'Yampi',
    description: 'Plataforma de e-commerce',
    category: 'E-commerce',
    logo: 'https://ext.same-assets.com/127242217/2331241454.png',
    icon: Store,
    color: 'bg-indigo-600',
    fields: [
      {
        name: 'apiKey',
        type: 'password',
        label: 'Chave da API',
        placeholder: 'Digite sua chave da API',
        required: true
      }
    ]
  }
];

export const CATEGORIES = Array.from(new Set(PLATFORMS.map(p => p.category)));