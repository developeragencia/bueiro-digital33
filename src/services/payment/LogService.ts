import { supabase } from '../../lib/supabase';

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';

export interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  platform_id?: string;
  transaction_id?: string;
  user_id?: string;
  created_at?: string;
}

export class PaymentLogService {
  private readonly table = 'payment_logs';

  async log(entry: Omit<LogEntry, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.table)
        .insert([entry]);

      if (error) {
        console.error('Error saving log entry:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save log entry:', error);
      // Em caso de falha ao salvar no banco, salvamos no console como fallback
      console.log({
        level: entry.level,
        message: entry.message,
        context: entry.context,
        platform_id: entry.platform_id,
        transaction_id: entry.transaction_id,
        user_id: entry.user_id,
        timestamp: new Date().toISOString()
      });
    }
  }

  async info(message: string, context: Record<string, any> = {}, metadata: { 
    platform_id?: string;
    transaction_id?: string;
    user_id?: string;
  } = {}): Promise<void> {
    await this.log({
      level: 'info',
      message,
      context,
      ...metadata
    });
  }

  async warning(message: string, context: Record<string, any> = {}, metadata: {
    platform_id?: string;
    transaction_id?: string;
    user_id?: string;
  } = {}): Promise<void> {
    await this.log({
      level: 'warning',
      message,
      context,
      ...metadata
    });
  }

  async error(message: string, error: Error | unknown, context: Record<string, any> = {}, metadata: {
    platform_id?: string;
    transaction_id?: string;
    user_id?: string;
  } = {}): Promise<void> {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    };

    await this.log({
      level: 'error',
      message,
      context: errorContext,
      ...metadata
    });
  }

  async debug(message: string, context: Record<string, any> = {}, metadata: {
    platform_id?: string;
    transaction_id?: string;
    user_id?: string;
  } = {}): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      await this.log({
        level: 'debug',
        message,
        context,
        ...metadata
      });
    }
  }

  async getLogsByLevel(level: LogLevel, limit: number = 100): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('level', level)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }

  async getLogsByPlatform(platformId: string, limit: number = 100): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('platform_id', platformId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }

  async getLogsByTransaction(transactionId: string): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  async getLogsByUser(userId: string, limit: number = 100): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }

  async getErrorLogs(limit: number = 100): Promise<LogEntry[]> {
    return this.getLogsByLevel('error', limit);
  }

  async searchLogs(query: {
    level?: LogLevel;
    platform_id?: string;
    transaction_id?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    message?: string;
    limit?: number;
  }): Promise<LogEntry[]> {
    let queryBuilder = supabase
      .from(this.table)
      .select('*');

    if (query.level) {
      queryBuilder = queryBuilder.eq('level', query.level);
    }

    if (query.platform_id) {
      queryBuilder = queryBuilder.eq('platform_id', query.platform_id);
    }

    if (query.transaction_id) {
      queryBuilder = queryBuilder.eq('transaction_id', query.transaction_id);
    }

    if (query.user_id) {
      queryBuilder = queryBuilder.eq('user_id', query.user_id);
    }

    if (query.start_date) {
      queryBuilder = queryBuilder.gte('created_at', query.start_date);
    }

    if (query.end_date) {
      queryBuilder = queryBuilder.lte('created_at', query.end_date);
    }

    if (query.message) {
      queryBuilder = queryBuilder.ilike('message', `%${query.message}%`);
    }

    queryBuilder = queryBuilder
      .order('created_at', { ascending: false })
      .limit(query.limit || 100);

    const { data, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    return data;
  }

  async cleanupOldLogs(days: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { error } = await supabase
      .from(this.table)
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw error;
    }
  }
}

export const paymentLogger = new PaymentLogService(); 