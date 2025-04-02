import { supabase } from '../../lib/supabase';
import { Transaction, TransactionStatus } from '../../types/payment';

export class TransactionServiceClass {
  private table = 'transactions';

  async create(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data: transaction, error } = await supabase
      .from(this.table)
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return transaction;
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const { data: transaction, error } = await supabase
      .from(this.table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return transaction;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getById(id: string): Promise<Transaction> {
    const { data: transaction, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return transaction;
  }

  async getByUserId(userId: string): Promise<Transaction[]> {
    const { data: transactions, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return transactions;
  }

  async getByPlatformId(platformId: string): Promise<Transaction[]> {
    const { data: transactions, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('platform_id', platformId);

    if (error) throw error;
    return transactions;
  }

  async getByStatus(status: TransactionStatus): Promise<Transaction[]> {
    const { data: transactions, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('status', status);

    if (error) throw error;
    return transactions;
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    return this.update(id, { status });
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const { data: transactions, error } = await supabase
      .from(this.table)
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) throw error;
    return transactions;
  }

  async getByOrderId(orderId: string): Promise<Transaction> {
    const { data: transaction, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) throw error;
    return transaction;
  }
}

export const TransactionService = new TransactionServiceClass(); 