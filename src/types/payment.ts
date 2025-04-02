export type PaymentPlatformType = 
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
  name: PaymentPlatformType;
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
  client_id: string;
  client_secret: string;
  webhook_url: string;
  webhook_secret: string;
}

export interface PlatformMetrics {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageTransactionValue: number;
  refundRate: number;
  chargebackRate: number;
}

export type PlatformStatus = 'active' | 'inactive';

export interface PaymentPlatform {
  id: string;
  name: PaymentPlatformType;
  description: string;
  is_active: boolean;
  settings: PlatformSettings;
  created_at: string;
  updated_at: string;
}

export interface PlatformIntegration {
  platform: AvailablePlatform;
  config: PlatformConfig;
  settings: PlatformSettings;
  status: PlatformStatus;
  metrics?: PlatformMetrics;
} 