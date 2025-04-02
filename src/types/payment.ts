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
  user_id: string;
  platform_id: string;
  order_id: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  metadata: any;
  created_at: string;
  updated_at: string;
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
  features: {
    webhooks: boolean;
    refunds: boolean;
    subscriptions: boolean;
    split_payments: boolean;
  };
  limits: {
    min_amount: number;
    max_amount: number;
    daily_transactions: number;
    monthly_transactions: number;
  };
  currencies: string[];
  payment_methods: string[];
  countries: string[];
  test_mode: boolean;
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
  is_active: boolean;
  last_checked: string;
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