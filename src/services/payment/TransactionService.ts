import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/supabase';

class TransactionService {
  async create(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async update(id: string, transaction: Partial<Transaction>) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  async getByUserId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  async getByPlatformId(platformId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('platform_id', platformId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting platform transactions:', error);
      throw error;
    }
  }

  async getByOrderId(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting transaction by order:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService(); 