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