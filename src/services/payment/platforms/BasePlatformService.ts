import { Transaction } from '../../../types/payment';
import { supabase } from '../../../lib/supabase';

export abstract class BasePlatformService {
  protected readonly platformId: string;
  protected readonly apiKey: string;
  protected readonly secretKey?: string;
  protected readonly sandbox: boolean;

  constructor(platformId: string, apiKey: string, secretKey?: string, sandbox: boolean = true) {
    this.platformId = platformId;
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.sandbox = sandbox;
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
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  protected async updateTransactionStatus(transactionId: string, status: Transaction['status']): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('order_id', transactionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
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

  protected async deleteTransaction(transactionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('order_id', transactionId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  abstract processPayment(
    amount: number,
    currency: string,
    customer: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Transaction>;

  abstract processRefund(
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction>;

  abstract validateWebhook(
    payload: Record<string, any>,
    signature: string
  ): boolean;

  abstract getTransaction(orderId: string): Promise<Record<string, any>>;

  protected abstract calculateSignature(data: string): string;
} 