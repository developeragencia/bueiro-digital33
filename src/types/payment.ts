export type PaymentPlatform = 
  | 'shopify'
  | 'systeme'
  | 'strivpay'
  | 'appmax'
  | 'pepper'
  | 'logzz'
  | 'maxweb'
  | 'digistore24'
  | 'fortpay'
  | 'clickbank'
  | 'cartpanda'
  | 'doppus'
  | 'nitro'
  | 'mundpay'
  | 'pagtrust'
  | 'hubla'
  | 'ticto'
  | 'kiwify'
  | 'frc';

export interface PaymentPlatformConfig {
  id: string;
  name: PaymentPlatform;
  apiKey: string;
  secretKey?: string;
  merchantId?: string;
  enabled: boolean;
  webhookUrl?: string;
  sandbox: boolean;
  additionalConfig?: Record<string, string>;
}

export interface PaymentPlatformStats {
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  refundRate: number;
  chargebackRate: number;
}

export interface Transaction {
  id: string;
  platformId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'chargeback';
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  };
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface AvailablePlatform {
  id: string;
  name: string;
  description: string;
  logo: string;
}

export interface PlatformConfig {
  apiKey?: string;
  secretKey?: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

export interface PlatformCredentials {
  apiKey: string;
  secretKey?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  events?: string[];
}

export interface PlatformFeatures {
  webhooks: boolean;
  refunds: boolean;
  subscriptions: boolean;
  splitPayments: boolean;
  customerManagement: boolean;
  productCatalog: boolean;
  orderManagement: boolean;
  reporting: boolean;
}

export interface PlatformLimits {
  maxTransactionAmount?: number;
  minTransactionAmount?: number;
  maxRefundPeriod?: number;
  maxWebhookRetries?: number;
  maxConcurrentRequests?: number;
}

export interface PlatformSettings {
  features: PlatformFeatures;
  limits?: PlatformLimits;
  supportedCurrencies: string[];
  supportedPaymentMethods: string[];
  supportedCountries: string[];
  testMode: boolean;
}

export interface PlatformMetrics {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageTransactionValue: number;
  refundRate: number;
  chargebackRate: number;
}

export interface PlatformStatus {
  isActive: boolean;
  lastChecked: Date;
  uptime: number;
  latency: number;
  errors: number;
}

export interface PlatformIntegration {
  platform: AvailablePlatform;
  config: PlatformConfig;
  settings: PlatformSettings;
  status: PlatformStatus;
  metrics?: PlatformMetrics;
} 