import { PlatformConfig, Transaction, PlatformStatusData, TransactionStatus, Currency, Customer, PaymentMethod, WebhookPayload } from '../../../types/payment';
import { supabase } from '../../../lib/supabase';
import axios, { AxiosError } from 'axios';
import { logger } from '../../../utils/logger';

interface PlatformError extends Error {
  code?: string;
  details?: string;
  statusCode?: number;
}

type TransactionFilters = {
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  orderId?: string;
  platformId?: string;
};

export abstract class BasePlatformService {
  constructor(protected config: PlatformConfig) {}

  abstract processPayment(
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction>;

  abstract refundTransaction(
    transactionId: string,
    amount?: number
  ): Promise<Transaction>;

  abstract getTransaction(transactionId: string): Promise<Transaction>;

  abstract getTransactions(
    startDate?: Date,
    endDate?: Date
  ): Promise<Transaction[]>;

  abstract getStatus(): Promise<PlatformStatusData>;

  abstract cancelTransaction(transactionId: string): Promise<Transaction>;

  abstract validateWebhookSignature(
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean>;

  protected getApiUrl(): string {
    return this.config.settings.sandbox
      ? this.getSandboxApiUrl()
      : this.getProductionApiUrl();
  }

  protected abstract getSandboxApiUrl(): string;
  protected abstract getProductionApiUrl(): string;

  protected getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.settings.apiKey}`,
    };
  }

  protected handleError(error: any): never {
    if (error.response) {
      throw new Error(
        `API Error: ${error.response.status} - ${error.response.data.message}`
      );
    }
    throw error;
  }

  updateConfig(newConfig: Partial<PlatformConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  protected async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: Record<string, any>,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.getApiUrl()}${endpoint}`,
        headers: this.getHeaders(),
        data,
        params
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  protected async saveTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to save transaction');

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error(`Failed to save transaction: ${errorMessage}`);
      throw this.handleError(error);
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
      if (!data) throw new Error('Transaction not found');

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

  protected handleDatabaseError(error: unknown, context: string): Error {
    if (error instanceof Error) {
      return new Error(`${context}: ${error.message}`);
    }
    return new Error(`${context}: Unknown error`);
  }

  protected createError(message: string, error: unknown): Error {
    if (axios.isAxiosError(error) && error.response?.data) {
      return new Error(`${message}: ${JSON.stringify(error.response.data)}`);
    }
    return new Error(message);
  }

  protected async getTransactionByOrderId(orderId: string): Promise<Transaction | null> {
    return this.listTransactions({ orderId }).then(transactions => transactions[0] || null);
  }

  protected async getTransactionsByPlatformId(): Promise<Transaction[]> {
    return this.listTransactions({ platformId: this.config.platform_id });
  }

  protected getApiKey(): string {
    if (!this.config.settings.apiKey) {
      throw new Error('API Key not configured');
    }
    return this.config.settings.apiKey;
  }

  protected getSecretKey(): string {
    if (!this.config.settings.secretKey) {
      throw new Error('Secret Key not configured');
    }
    return this.config.settings.secretKey;
  }

  protected getWebhookSecret(): string {
    if (!this.config.settings.webhookSecret) {
      throw new Error('Webhook Secret not configured');
    }
    return this.config.settings.webhookSecret;
  }

  protected isSandbox(): boolean {
    return this.config.settings.sandbox || false;
  }
} 