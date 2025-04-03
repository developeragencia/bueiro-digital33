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

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled'
  | 'disputed'
  | 'expired'
  | 'authorized'
  | 'captured'
  | 'voided'
  | 'chargeback';

export type PlatformStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export interface PlatformSettings {
  webhookUrl: string;
  webhookSecret: string;
  apiKey: string;
  secretKey: string;
  sandbox: boolean;
  name: string;
  description?: string;
  logo?: string;
}

export interface PlatformConfig {
  platformId: string;
  name: string;
  settings: PlatformSettings;
  apiKey: string;
  secretKey: string;
  sandbox: boolean;
}

export interface PlatformStatusData {
  platform_id: string;
  is_active: boolean;
  uptime: number;
  error_rate: number;
  last_check: Date;
  status: PlatformStatus;
  message?: string;
}

export interface Customer {
  id?: string;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  address?: {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    zipcode?: string;
  };
}

export interface PaymentPlatform {
  id: string;
  name: string;
  type: PaymentPlatformType;
  settings: PlatformSettings;
  status: PlatformStatus;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  platform_id: string;
  platform_type: PaymentPlatformType;
  platform_settings: PlatformSettings;
  order_id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  customer: Customer;
  payment_method: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AvailablePlatform {
  id: string;
  name: string;
  platform: PaymentPlatformType;
  logo: string;
  description?: string;
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