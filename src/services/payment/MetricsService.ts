import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/payment';
import { paymentLogger } from './LogService';

export interface TransactionMetrics {
  total_transactions: number;
  total_amount: number;
  average_amount: number;
  success_rate: number;
  failure_rate: number;
  refund_rate: number;
  chargeback_rate: number;
}

export interface PlatformMetrics {
  platform_id: string;
  total_transactions: number;
  total_amount: number;
  average_amount: number;
  success_rate: number;
  failure_rate: number;
  refund_rate: number;
  chargeback_rate: number;
  average_processing_time: number;
  uptime: number;
  error_rate: number;
}

export interface UserMetrics {
  user_id: string;
  total_transactions: number;
  total_amount: number;
  average_amount: number;
  success_rate: number;
  failure_rate: number;
  refund_rate: number;
  preferred_payment_methods: Record<string, number>;
  last_transaction_date: string;
}

export class PaymentMetricsService {
  private readonly metricsTable = 'payment_metrics';
  private readonly transactionsTable = 'transactions';
  private readonly platformsTable = 'payment_platforms';
  private readonly logsTable = 'payment_logs';

  async calculateTransactionMetrics(
    startDate?: string,
    endDate?: string,
    platformId?: string,
    userId?: string
  ): Promise<TransactionMetrics> {
    try {
      let query = supabase
        .from(this.transactionsTable)
        .select('*');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      if (platformId) {
        query = query.eq('platform_id', platformId);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: transactions, error } = await query;

      if (error) {
        throw error;
      }

      const totalTransactions = transactions.length;
      const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const successfulTransactions = transactions.filter(tx => tx.status === 'completed').length;
      const failedTransactions = transactions.filter(tx => tx.status === 'failed').length;
      const refundedTransactions = transactions.filter(tx => tx.status === 'refunded').length;
      const chargebackTransactions = transactions.filter(tx => tx.status === 'chargeback').length;

      return {
        total_transactions: totalTransactions,
        total_amount: totalAmount,
        average_amount: totalTransactions > 0 ? totalAmount / totalTransactions : 0,
        success_rate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
        failure_rate: totalTransactions > 0 ? (failedTransactions / totalTransactions) * 100 : 0,
        refund_rate: totalTransactions > 0 ? (refundedTransactions / totalTransactions) * 100 : 0,
        chargeback_rate: totalTransactions > 0 ? (chargebackTransactions / totalTransactions) * 100 : 0
      };
    } catch (error) {
      paymentLogger.error(
        'Failed to calculate transaction metrics',
        error,
        { startDate, endDate, platformId, userId }
      );
      throw error;
    }
  }

  async calculatePlatformMetrics(
    platformId: string,
    startDate?: string,
    endDate?: string
  ): Promise<PlatformMetrics> {
    try {
      const transactionMetrics = await this.calculateTransactionMetrics(startDate, endDate, platformId);

      // Calcular tempo médio de processamento
      const { data: transactions, error: txError } = await supabase
        .from(this.transactionsTable)
        .select('created_at, updated_at')
        .eq('platform_id', platformId)
        .eq('status', 'completed');

      if (txError) {
        throw txError;
      }

      const processingTimes = transactions
        .map(tx => new Date(tx.updated_at).getTime() - new Date(tx.created_at).getTime())
        .filter(time => time > 0);

      const averageProcessingTime = processingTimes.length > 0
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
        : 0;

      // Calcular uptime e taxa de erro
      const { data: logs, error: logsError } = await supabase
        .from(this.logsTable)
        .select('*')
        .eq('platform_id', platformId)
        .gte('created_at', startDate || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (logsError) {
        throw logsError;
      }

      const totalChecks = logs.length;
      const errorLogs = logs.filter(log => log.level === 'error').length;
      const uptime = totalChecks > 0 ? ((totalChecks - errorLogs) / totalChecks) * 100 : 100;
      const errorRate = totalChecks > 0 ? (errorLogs / totalChecks) * 100 : 0;

      return {
        platform_id: platformId,
        ...transactionMetrics,
        average_processing_time: averageProcessingTime,
        uptime,
        error_rate: errorRate
      };
    } catch (error) {
      paymentLogger.error(
        'Failed to calculate platform metrics',
        error,
        { platformId, startDate, endDate }
      );
      throw error;
    }
  }

  async calculateUserMetrics(userId: string): Promise<UserMetrics> {
    try {
      const transactionMetrics = await this.calculateTransactionMetrics(undefined, undefined, undefined, userId);

      const { data: transactions, error } = await supabase
        .from(this.transactionsTable)
        .select('payment_method, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const paymentMethods: Record<string, number> = {};
      transactions.forEach(tx => {
        if (tx.payment_method) {
          paymentMethods[tx.payment_method] = (paymentMethods[tx.payment_method] || 0) + 1;
        }
      });

      const lastTransactionDate = transactions.length > 0 ? transactions[0].created_at : null;

      return {
        user_id: userId,
        ...transactionMetrics,
        preferred_payment_methods: paymentMethods,
        last_transaction_date: lastTransactionDate
      };
    } catch (error) {
      paymentLogger.error(
        'Failed to calculate user metrics',
        error,
        { userId }
      );
      throw error;
    }
  }

  async saveMetricsSnapshot(): Promise<void> {
    try {
      const { data: platforms, error: platformsError } = await supabase
        .from(this.platformsTable)
        .select('id');

      if (platformsError) {
        throw platformsError;
      }

      const metrics = await Promise.all(
        platforms.map(async platform => {
          const platformMetrics = await this.calculatePlatformMetrics(platform.id);
          return {
            platform_id: platform.id,
            metrics: platformMetrics,
            timestamp: new Date().toISOString()
          };
        })
      );

      const { error } = await supabase
        .from(this.metricsTable)
        .insert(metrics);

      if (error) {
        throw error;
      }
    } catch (error) {
      paymentLogger.error(
        'Failed to save metrics snapshot',
        error
      );
      throw error;
    }
  }

  async getMetricsHistory(
    platformId: string,
    startDate: string,
    endDate: string
  ): Promise<PlatformMetrics[]> {
    const { data, error } = await supabase
      .from(this.metricsTable)
      .select('*')
      .eq('platform_id', platformId)
      .gte('timestamp', startDate)
      .lte('timestamp', endDate)
      .order('timestamp', { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(record => record.metrics);
  }

  async generateDailyReport(): Promise<Record<string, any>> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
    const endDate = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();

    const overallMetrics = await this.calculateTransactionMetrics(startDate, endDate);
    
    const { data: platforms, error: platformsError } = await supabase
      .from(this.platformsTable)
      .select('id');

    if (platformsError) {
      throw platformsError;
    }

    const platformMetrics = await Promise.all(
      platforms.map(platform => this.calculatePlatformMetrics(platform.id, startDate, endDate))
    );

    return {
      date: yesterday.toISOString().split('T')[0],
      overall: overallMetrics,
      platforms: platformMetrics
    };
  }

  async analyzeTransactionTrends(
    days: number = 30
  ): Promise<Record<string, any>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyMetrics = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayStart = new Date(currentDate.setHours(0, 0, 0, 0)).toISOString();
      const dayEnd = new Date(currentDate.setHours(23, 59, 59, 999)).toISOString();

      const metrics = await this.calculateTransactionMetrics(dayStart, dayEnd);
      dailyMetrics.push({
        date: currentDate.toISOString().split('T')[0],
        metrics
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      daily_metrics: dailyMetrics,
      trends: this.calculateTrends(dailyMetrics)
    };
  }

  private calculateTrends(dailyMetrics: Array<{ date: string; metrics: TransactionMetrics }>): Record<string, any> {
    const totalDays = dailyMetrics.length;
    if (totalDays < 2) return {};

    const firstHalf = dailyMetrics.slice(0, Math.floor(totalDays / 2));
    const secondHalf = dailyMetrics.slice(Math.floor(totalDays / 2));

    const calculateAverage = (metrics: typeof dailyMetrics, key: keyof TransactionMetrics) => {
      return metrics.reduce((sum, day) => sum + day.metrics[key], 0) / metrics.length;
    };

    const calculateGrowth = (first: number, second: number) => {
      return first === 0 ? 0 : ((second - first) / first) * 100;
    };

    const metrics = [
      'total_transactions',
      'total_amount',
      'average_amount',
      'success_rate',
      'failure_rate',
      'refund_rate',
      'chargeback_rate'
    ] as const;

    const trends: Record<string, { growth: number; trend: 'up' | 'down' | 'stable' }> = {};

    metrics.forEach(metric => {
      const firstHalfAvg = calculateAverage(firstHalf, metric);
      const secondHalfAvg = calculateAverage(secondHalf, metric);
      const growth = calculateGrowth(firstHalfAvg, secondHalfAvg);

      trends[metric] = {
        growth,
        trend: growth > 1 ? 'up' : growth < -1 ? 'down' : 'stable'
      };
    });

    return trends;
  }
}

export const paymentMetrics = new PaymentMetricsService();