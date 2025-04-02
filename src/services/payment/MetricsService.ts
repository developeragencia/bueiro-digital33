import { supabase } from '../../lib/supabase';
import { PlatformMetrics } from '../../types/payment';

interface MetricsData {
  id: string;
  created_at: string;
  platform_id: string;
  total_transactions: number;
  total_volume: number;
  success_rate: number;
  average_transaction_value: number;
  refund_rate: number;
  chargeback_rate: number;
  updated_at: string;
}

class MetricsService {
  async createMetrics(metrics: Omit<MetricsData, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('platform_metrics')
        .insert([metrics])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating platform metrics:', error);
      throw error;
    }
  }

  async updateMetrics(id: string, metrics: Partial<MetricsData>) {
    try {
      const { data, error } = await supabase
        .from('platform_metrics')
        .update(metrics)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating platform metrics:', error);
      throw error;
    }
  }

  async getMetrics(platformId: string): Promise<PlatformMetrics> {
    try {
      const { data, error } = await supabase
        .from('platform_metrics')
        .select('*')
        .eq('platform_id', platformId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      return {
        totalTransactions: data.total_transactions,
        totalVolume: data.total_volume,
        successRate: data.success_rate,
        averageTransactionValue: data.average_transaction_value,
        refundRate: data.refund_rate,
        chargebackRate: data.chargeback_rate
      };
    } catch (error) {
      console.error('Error getting platform metrics:', error);
      throw error;
    }
  }

  async getMetricsHistory(platformId: string, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('platform_metrics')
        .select('*')
        .eq('platform_id', platformId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting platform metrics history:', error);
      throw error;
    }
  }

  async calculateMetrics(platformId: string): Promise<PlatformMetrics> {
    try {
      // Get all transactions for the platform
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('platform_id', platformId);

      if (txError) throw txError;

      if (!transactions || transactions.length === 0) {
        return {
          totalTransactions: 0,
          totalVolume: 0,
          successRate: 0,
          averageTransactionValue: 0,
          refundRate: 0,
          chargebackRate: 0
        };
      }

      // Calculate metrics
      const totalTransactions = transactions.length;
      const successfulTransactions = transactions.filter(tx => tx.status === 'success');
      const refundedTransactions = transactions.filter(tx => tx.status === 'refunded');
      const chargebackTransactions = transactions.filter(tx => tx.status === 'chargeback');

      const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      const successRate = (successfulTransactions.length / totalTransactions) * 100;
      const averageTransactionValue = totalVolume / totalTransactions;
      const refundRate = (refundedTransactions.length / totalTransactions) * 100;
      const chargebackRate = (chargebackTransactions.length / totalTransactions) * 100;

      const metrics: PlatformMetrics = {
        totalTransactions,
        totalVolume,
        successRate,
        averageTransactionValue,
        refundRate,
        chargebackRate
      };

      // Save the calculated metrics
      await this.createMetrics({
        platform_id: platformId,
        total_transactions: totalTransactions,
        total_volume: totalVolume,
        success_rate: successRate,
        average_transaction_value: averageTransactionValue,
        refund_rate: refundRate,
        chargeback_rate: chargebackRate
      });

      return metrics;
    } catch (error) {
      console.error('Error calculating platform metrics:', error);
      throw error;
    }
  }

  async deleteOldMetrics(days = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { error } = await supabase
        .from('platform_metrics')
        .delete()
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting old metrics:', error);
      throw error;
    }
  }
}

export const metricsService = new MetricsService(); 