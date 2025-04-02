export type PaymentPlatformType =
  | 'appmax'
  | 'cartpanda'
  | 'clickbank'
  | 'digistore24'
  | 'doppus'
  | 'fortpay'
  | 'frc'
  | 'hubla'
  | 'kiwify'
  | 'logzz'
  | 'maxweb'
  | 'mundpay'
  | 'nitro'
  | 'pagtrust'
  | 'pepper'
  | 'shopify'
  | 'strivpay'
  | 'systeme'
  | 'ticto';

export interface PlatformSettings {
  apiKey: string;
  secretKey?: string;
  sandbox?: boolean;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  redirectUrl?: string;
  notificationUrl?: string;
  customFields?: Record<string, any>;
}

export interface PaymentPlatform {
  id: string;
  user_id: string;
  platform: PaymentPlatformType;
  name: string;
  description?: string;
  is_active: boolean;
  settings: PlatformSettings;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id?: string;
  order_id: string;
  platform_id: string;
  platform_type: PaymentPlatformType;
  platform_settings: {
    apiKey: string;
    secretKey: string;
    sandbox?: boolean;
  };
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_method: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export type TransactionStatus = 'pending' | 'approved' | 'declined' | 'refunded' | 'chargeback';

export interface PlatformStatusData {
  is_active: boolean;
  last_checked: string;
  uptime: number;
  latency: number;
  errors: number;
}

export interface AvailablePlatform {
  id: string;
  name: string;
  platform: PaymentPlatformType;
  logo: string;
  description?: string;
}

export interface PlatformConfig {
  apiKey: string;
  secretKey?: string;
  sandbox?: boolean;
  clientId?: string;
  clientSecret?: string;
}

export interface PlatformIntegration {
  id: string;
  platform_id: string;
  user_id: string;
  settings: PlatformSettings;
  status: PlatformStatusData;
  created_at: string;
  updated_at: string;
}

export interface PaymentPlatformStats {
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
  refundRate: number;
  chargebackRate: number;
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

export interface PlatformMetrics {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageTransactionValue: number;
  refundRate: number;
  chargebackRate: number;
} 