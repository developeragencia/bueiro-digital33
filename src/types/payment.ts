export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  ERROR = 'error',
  UNKNOWN = 'unknown'
}

export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  JPY = 'JPY',
  CAD = 'CAD',
  AUD = 'AUD',
  CHF = 'CHF',
  CNY = 'CNY',
  INR = 'INR'
}

export enum PaymentPlatform {
  APPMAX = 'appmax',
  CARTPANDA = 'cartpanda',
  CLICKBANK = 'clickbank',
  DIGISTORE24 = 'digistore24',
  DOPPUS = 'doppus',
  FORTPAY = 'fortpay',
  FRC = 'frc',
  HUBLA = 'hubla',
  KIWIFY = 'kiwify',
  LOGZZ = 'logzz',
  MAXWEB = 'maxweb',
  MUNDPAY = 'mundpay',
  NITRO = 'nitro',
  PAGTRUST = 'pagtrust',
  PEPPER = 'pepper',
  SHOPIFY = 'shopify',
  STRIVPAY = 'strivpay',
  SYSTEME = 'systeme',
  TICTO = 'ticto',
  TWISPAY = 'twispay',
  WOOCOMMERCE = 'woocommerce',
  YAPAY = 'yapay'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BOLETO = 'boleto',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
  CRYPTO = 'crypto',
  CASH = 'cash',
  OTHER = 'other'
}

export interface Customer {
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
    zip_code?: string;
  };
}

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

export interface PlatformSettings {
  id: string;
  name: string;
  platform: PaymentPlatform;
  logo: string;
  description?: string;
  settings: {
    webhookUrl?: string;
    webhookSecret?: string;
    currency?: Currency;
    apiKey?: string;
    secretKey?: string;
    sandbox?: boolean;
    name?: string;
  };
}

export interface PlatformConfig {
  platform_id: string;
  platform_type: string;
  settings: {
    apiKey?: string;
    secretKey?: string;
    sandbox?: boolean;
    webhookSecret?: string;
    [key: string]: any;
  };
}

export interface PlatformStatusData {
  is_active: boolean;
  error_rate: number;
  status: TransactionStatus;
  last_checked: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  platform_id: string;
  platform_type: string;
  platform_settings: Record<string, any>;
  order_id: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  customer: Customer;
  payment_method: PaymentMethod;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface AvailablePlatform {
  id: string;
  name: string;
  platform: PaymentPlatform;
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
  total_transactions: number;
  total_amount: number;
  success_rate: number;
  error_rate: number;
  average_response_time: number;
  uptime_percentage: number;
}

export interface WebhookPayload {
  event: string;
  data: Record<string, any>;
  timestamp: number;
  signature: string;
}

export interface ReconciliationResult {
  platform_id: string;
  missing_transactions: Transaction[];
  mismatched_transactions: Transaction[];
  reconciled_transactions: Transaction[];
  total_amount_difference: number;
  reconciliation_date: string;
}

export interface FraudCheckResult {
  transaction_id: string;
  risk_score: number;
  risk_factors: string[];
  is_fraudulent: boolean;
  check_date: string;
}

export interface AuditLogEntry {
  id: string;
  platform_id: string;
  action: string;
  details: Record<string, any>;
  user_id?: string;
  created_at: string;
}

export interface ReportData {
  start_date: Date;
  end_date: Date;
  platform_id: string;
  metrics: PlatformMetrics;
  format: 'csv' | 'json' | 'pdf';
}

export interface PaymentData {
  user_id: string;
  customer: Customer;
  description?: string;
  order_id?: string;
  invoice_id?: string;
  [key: string]: any;
}

export interface RefundData {
  transaction_id: string;
  amount?: number;
  reason?: string;
  [key: string]: any;
}

export interface WebhookData {
  signature: string;
  payload: Record<string, any>;
  [key: string]: any;
} 