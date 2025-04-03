export type PaymentPlatformType =
  | 'stripe'
  | 'paypal'
  | 'mercadopago'
  | 'pagseguro'
  | 'cielo'
  | 'rede'
  | 'getnet'
  | 'stone'
  | 'pepper'
  | 'logzz'
  | 'maxweb'
  | 'mundpay'
  | 'nitro'
  | 'pagtrust'
  | 'shopify'
  | 'strivpay'
  | 'systeme'
  | 'woocommerce'
  | 'yapay'
  | 'kiwify';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'chargeback'
  | 'dispute'
  | 'authorized'
  | 'cancelled'
  | 'expired';

export type PlatformStatus = 'active' | 'inactive' | 'error' | 'maintenance';

export type Currency = 'BRL' | 'USD' | 'EUR';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'boleto'
  | 'pix'
  | 'bank_transfer'
  | 'crypto';

export interface Address {
  street: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
}

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
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
  metadata?: Record<string, unknown>;
  created_at?: Date;
  updated_at?: Date;
}

export interface PlatformSettings {
  webhookUrl?: string;
  webhookSecret?: string;
  currency: Currency;
  apiKey: string;
  secretKey?: string;
  sandbox: boolean;
  name: string;
  description?: string;
  logo?: string;
  features?: PlatformFeatures;
  limits?: PlatformLimits;
  credentials?: PlatformCredentials;
  webhook?: WebhookConfig;
  metadata?: Record<string, unknown>;
  active?: boolean;
}

export interface PlatformConfig {
  user_id: string;
  platform_id: string;
  platform_type: PaymentPlatformType;
  settings: PlatformSettings;
  created_at?: Date;
  updated_at?: Date;
}

export interface PlatformStatusData {
  platform_id: string;
  status: TransactionStatus;
  error_rate: number;
  success_rate: number;
  is_active: boolean;
  last_checked: Date;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export interface PaymentPlatform {
  id: string;
  name: string;
  description: string;
  status: PlatformStatusData;
  metadata?: Record<string, any>;
}

export interface Transaction {
  id: string;
  user_id: string;
  platform_id: string;
  platform_type: PaymentPlatformType;
  order_id: string;
  amount: number;
  currency: Currency;
  customer: Customer;
  payment_method: PaymentMethod;
  platform_settings: PlatformSettings;
  status: TransactionStatus;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export interface AvailablePlatform {
  id: string;
  name: string;
  platform: PaymentPlatformType;
  logo: string;
  description?: string;
  features?: PlatformFeatures;
  limits?: PlatformLimits;
  pricing?: {
    setup_fee?: number;
    transaction_fee?: number;
    monthly_fee?: number;
    currency: Currency;
  };
}

export interface PlatformIntegration {
  id: string;
  platform_id: string;
  user_id: string;
  settings: PlatformSettings;
  status: PlatformStatusData;
  features?: PlatformFeatures;
  limits?: PlatformLimits;
  metadata?: Record<string, unknown>;
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
  period: {
    start: Date;
    end: Date;
  };
  currency: Currency;
}

export interface PlatformCredentials {
  apiKey: string;
  secretKey?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface WebhookConfig {
  url: string;
  secret?: string;
  events?: string[];
  retryPolicy?: {
    maxAttempts: number;
    backoffDelay: number;
  };
  metadata?: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
}

export interface PlatformLimits {
  maxTransactionAmount?: number;
  minTransactionAmount?: number;
  maxRefundPeriod?: number;
  maxWebhookRetries?: number;
  maxConcurrentRequests?: number;
  currency?: Currency;
  metadata?: Record<string, unknown>;
}

export interface PlatformMetrics {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageTransactionValue: number;
  refundRate: number;
  chargebackRate: number;
  period: {
    start: Date;
    end: Date;
  };
  currency: Currency;
  metadata?: Record<string, unknown>;
} 