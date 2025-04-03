import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus } from '../../../types/payment';
import { supabase } from '../../../lib/supabase';

export abstract class BasePlatformService {
  protected readonly platformId: string;
  protected readonly apiKey: string;
  protected readonly secretKey: string;
  protected readonly sandbox: boolean;
  protected config: PlatformConfig;

  constructor(config: PlatformConfig) {
    this.platformId = config.platformId;
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;
    this.sandbox = config.sandbox || false;
    this.config = config;
  }

  protected abstract getSandboxApiUrl(): string;
  protected abstract getProductionApiUrl(): string;

  protected getApiUrl(): string {
    return this.sandbox ? this.getSandboxApiUrl() : this.getProductionApiUrl();
  }

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  protected validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error('API Key is required');
    }
  }

  protected validateSecretKey(): void {
    if (!this.secretKey) {
      throw new Error('Secret Key is required');
    }
  }

  protected async saveTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save transaction: ${error.message}`);
    }

    return data;
  }

  protected async getTransactionById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }

    return data;
  }

  protected async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update transaction: ${error.message}`);
    }

    return data;
  }

  protected async deleteTransaction(id: string): Promise<void> {
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  }

  protected async listTransactions(filters: Record<string, any> = {}): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .match(filters);

    if (error) {
      throw new Error(`Failed to list transactions: ${error.message}`);
    }

    return data || [];
  }

  protected async updateTransactionStatus(id: string, status: TransactionStatus): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .update({ status, updated_at: new Date() })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update transaction status: ${error.message}`);
    }
  }

  protected handleApiError(error: any): never {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unknown error occurred');
  }

  protected async getTransactionByOrderId(orderId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  protected async getTransactionsByPlatformId(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('platform_id', this.platformId);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  protected async getTransactionsByStatus(status: Transaction['status']): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('platform_id', this.platformId)
        .eq('status', status);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching transactions by status:', error);
      throw error;
    }
  }

  protected async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('platform_id', this.platformId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  }

  abstract processPayment(data: Record<string, any>): Promise<Transaction>;
  
  abstract processRefund(transactionId: string, amount?: number, reason?: string): Promise<Transaction>;
  
  abstract validateWebhook(payload: Record<string, any>, signature: string): Promise<boolean>;
  
  abstract getTransaction(transactionId: string): Promise<Transaction>;
  
  abstract getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]>;
  
  abstract getStatus(): Promise<PlatformStatusData>;
  
  abstract updateConfig(config: Partial<PlatformConfig>): Promise<void>;

  protected mapStatus(status: string): Transaction['status'] {
    const statusMap: Record<string, Transaction['status']> = {
      'completed': 'completed',
      'pending': 'pending',
      'processing': 'processing',
      'failed': 'failed',
      'refunded': 'refunded',
      'partially_refunded': 'refunded',
      'cancelled': 'cancelled',
      'expired': 'failed'
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }
} 