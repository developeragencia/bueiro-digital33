import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod } from '../../../types/payment';
import { supabase } from '../../../lib/supabase';
import axios from 'axios';

interface PlatformError extends Error {
  code?: string;
  details?: string;
  statusCode?: number;
}

type TransactionFilters = {
  status?: Transaction['status'];
  startDate?: Date;
  endDate?: Date;
  orderId?: string;
  platformId?: string;
};

export abstract class BasePlatformService {
  protected config: PlatformConfig;
  protected readonly SANDBOX_API_URL: string;
  protected readonly PRODUCTION_API_URL: string;

  constructor(config: PlatformConfig) {
    this.config = config;
    this.SANDBOX_API_URL = this.getSandboxApiUrl();
    this.PRODUCTION_API_URL = this.getProductionApiUrl();
  }

  abstract getSandboxApiUrl(): string;
  abstract getProductionApiUrl(): string;

  protected getApiUrl(): string {
    return this.config.sandbox ? this.SANDBOX_API_URL : this.PRODUCTION_API_URL;
  }

  protected abstract getHeaders(): Record<string, string>;

  protected validateApiKey(): void {
    if (!this.config.settings.apiKey) {
      throw this.createError('API Key is required', 'INVALID_API_KEY');
    }
  }

  protected validateSecretKey(): void {
    if (!this.config.settings.secretKey) {
      throw this.createError('Secret Key is required', 'INVALID_SECRET_KEY');
    }
  }

  protected async saveTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw this.createError('Failed to save transaction', 'TRANSACTION_SAVE_ERROR');

      return data;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to save transaction');
    }
  }

  protected async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to get transaction');
    }
  }

  protected async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ ...updates, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw this.createError('Transaction not found', 'TRANSACTION_NOT_FOUND');

      return data;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to update transaction');
    }
  }

  protected async deleteTransaction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to delete transaction');
    }
  }

  protected async listTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('platform_id', this.config.platform_id);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters.orderId) {
        query = query.eq('order_id', filters.orderId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to list transactions');
    }
  }

  protected async updateTransactionStatus(id: string, status: TransactionStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status, updated_at: new Date() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to update transaction status');
    }
  }

  protected handleApiError(error: unknown): never {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      const apiError = this.createError(
        error.message,
        'API_ERROR',
        error instanceof Error && 'statusCode' in error ? (error as any).statusCode : undefined
      );
      throw apiError;
    }

    throw this.createError('An unknown API error occurred', 'UNKNOWN_API_ERROR');
  }

  protected async getTransactionByOrderId(orderId: string): Promise<Transaction | null> {
    return this.listTransactions({ orderId }).then(transactions => transactions[0] || null);
  }

  protected async getTransactionsByPlatformId(): Promise<Transaction[]> {
    return this.listTransactions({ platformId: this.config.platform_id });
  }

  protected async getTransactionsByStatus(status: Transaction['status']): Promise<Transaction[]> {
    return this.listTransactions({ status });
  }

  protected async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.listTransactions({ startDate, endDate });
  }

  abstract processPayment(
    amount: number,
    currency: Currency,
    customer: Customer,
    metadata?: Record<string, any>
  ): Promise<Transaction>;

  abstract processRefund(
    transactionId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<Transaction>;

  abstract validateWebhook(
    payload: Record<string, any>,
    signature: string
  ): Promise<boolean>;

  abstract getTransaction(transactionId: string): Promise<Transaction>;

  abstract getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]>;

  abstract getStatus(): Promise<PlatformStatusData>;

  abstract updateConfig(config: Partial<PlatformConfig>): Promise<void>;

  protected mapStatus(status: string): TransactionStatus {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'waiting':
      case 'created':
        return 'pending';
      case 'processing':
      case 'in_progress':
        return 'processing';
      case 'authorized':
      case 'pre_authorized':
        return 'authorized';
      case 'paid':
      case 'completed':
      case 'approved':
      case 'success':
        return 'paid';
      case 'failed':
      case 'declined':
      case 'error':
        return 'failed';
      case 'cancelled':
      case 'canceled':
      case 'voided':
        return 'cancelled';
      case 'refunded':
        return 'refunded';
      case 'partially_refunded':
        return 'partially_refunded';
      case 'chargeback':
      case 'charged_back':
        return 'chargeback';
      case 'disputed':
      case 'dispute':
        return 'dispute';
      case 'inactive':
      case 'disabled':
        return 'inactive';
      default:
        return 'error';
    }
  }

  protected createError(message: string, originalError?: unknown): Error {
    if (originalError instanceof Error) {
      return new Error(`${message}: ${originalError.message}`);
    }
    return new Error(message);
  }

  protected handleDatabaseError(error: unknown, context: string): PlatformError {
    console.error(`Database Error (${context}):`, error);
    
    if (error instanceof Error) {
      return this.createError(
        `${context}: ${error.message}`,
        'DATABASE_ERROR',
        error instanceof Error && 'statusCode' in error ? (error as any).statusCode : undefined
      );
    }

    return this.createError(`${context}: Unknown error`, 'DATABASE_ERROR');
  }

  protected handleError(error: any): never {
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'An error occurred while processing the request'
      );
    }
    throw error;
  }
} 