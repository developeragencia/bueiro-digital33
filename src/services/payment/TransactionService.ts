import { Transaction, TransactionStatus } from '../../types/payment';
import { supabase } from '../../lib/supabase';

interface TransactionError extends Error {
  code: string;
  details?: string;
  statusCode?: number;
}

type TransactionFilters = {
  userId?: string;
  platformId?: string;
  status?: TransactionStatus;
  orderId?: string;
  startDate?: string;
  endDate?: string;
} & Partial<Transaction>;

export class TransactionService {
  private readonly table = 'transactions';

  async create(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .insert(transaction)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw this.createError('Failed to create transaction', 'TRANSACTION_CREATE_ERROR');

      return data;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to create transaction');
    }
  }

  async getById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to get transaction');
    }
  }

  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from(this.table)
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

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to delete transaction');
    }
  }

  async list(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      let query = supabase.from(this.table).select('*');

      if (filters) {
        if (filters.userId) query = query.eq('user_id', filters.userId);
        if (filters.platformId) query = query.eq('platform_id', filters.platformId);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.orderId) query = query.eq('order_id', filters.orderId);
        if (filters.startDate) query = query.gte('created_at', filters.startDate);
        if (filters.endDate) query = query.lte('created_at', filters.endDate);

        // Handle any additional Transaction fields
        Object.entries(filters).forEach(([key, value]) => {
          if (
            value !== undefined &&
            !['userId', 'platformId', 'status', 'orderId', 'startDate', 'endDate'].includes(key)
          ) {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to list transactions');
    }
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    try {
      return await this.update(id, { status });
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to update transaction status');
    }
  }

  async getByUserId(userId: string): Promise<Transaction[]> {
    return this.list({ userId });
  }

  async getByPlatformId(platformId: string): Promise<Transaction[]> {
    return this.list({ platformId });
  }

  async getByStatus(status: TransactionStatus): Promise<Transaction[]> {
    return this.list({ status });
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return this.list({ startDate, endDate });
  }

  async getByOrderId(orderId: string): Promise<Transaction | null> {
    try {
      const transactions = await this.list({ orderId });
      return transactions[0] || null;
    } catch (error) {
      throw this.handleDatabaseError(error, 'Failed to get transaction by order ID');
    }
  }

  private createError(message: string, code: string, statusCode?: number): TransactionError {
    const error = new Error(message) as TransactionError;
    error.code = code;
    if (statusCode) error.statusCode = statusCode;
    return error;
  }

  private handleDatabaseError(error: unknown, context: string): TransactionError {
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
} 