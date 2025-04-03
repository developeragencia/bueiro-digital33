import { Transaction, TransactionStatus } from '../../types/payment';
import { supabase } from '../../lib/supabase';

export type ReportFormat = 'csv' | 'json' | 'pdf';
export type ReportType = 'transactions' | 'reconciliation' | 'metrics';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  platformId?: string;
  status?: TransactionStatus;
  minAmount?: number;
  maxAmount?: number;
}

export interface ReportData {
  total_count: number;
  total_amount: number;
  transactions?: Transaction[];
  status_counts?: Record<TransactionStatus, number>;
  transactions_by_platform?: Record<string, {
    count: number;
    total_amount: number;
    transactions: Transaction[];
  }>;
  platform_metrics?: Record<string, {
    total_transactions: number;
    total_amount: number;
    success_rate: number;
    average_amount: number;
  }>;
  time_metrics?: {
    hourly: Record<number, { count: number; amount: number }>;
    daily: Record<number, { count: number; amount: number }>;
    monthly: Record<number, { count: number; amount: number }>;
  };
}

export class ReportService {
  private readonly table = 'reports';

  async generateReport(type: ReportType, format: ReportFormat, filters: ReportFilters = {}): Promise<string> {
    try {
      // Buscar dados para o relatório
      const data = await this.fetchReportData(type, filters);

      // Gerar arquivo no formato especificado
      let filePath: string;
      switch (format) {
        case 'csv':
          filePath = await this.generateCSV(data, `${type}_report`);
          break;
        case 'json':
          filePath = await this.generateJSON(data, `${type}_report`);
          break;
        case 'pdf':
          filePath = await this.generatePDF(data, `${type}_report`);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Salvar registro do relatório
      await this.saveReportRecord(type, format, filters, filePath);

      return filePath;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  private async fetchReportData(type: ReportType, filters: ReportFilters): Promise<ReportData> {
    let query = supabase.from('transactions').select('*');

    // Aplicar filtros
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString());
    }
    if (filters.platformId) {
      query = query.eq('platform_id', filters.platformId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.minAmount) {
      query = query.gte('amount', filters.minAmount);
    }
    if (filters.maxAmount) {
      query = query.lte('amount', filters.maxAmount);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const transactions = data as Transaction[];

    switch (type) {
      case 'transactions':
        return this.processTransactionData(transactions);
      case 'reconciliation':
        return this.processReconciliationData(transactions);
      case 'metrics':
        return this.processMetricsData(transactions);
      default:
        throw new Error(`Unsupported report type: ${type}`);
    }
  }

  private async generateCSV(data: ReportData, fileName: string): Promise<string> {
    // Implementar geração de arquivo CSV
    return `reports/${fileName}.csv`;
  }

  private async generateJSON(data: ReportData, fileName: string): Promise<string> {
    // Implementar geração de arquivo JSON
    return `reports/${fileName}.json`;
  }

  private async generatePDF(data: ReportData, fileName: string): Promise<string> {
    // Implementar geração de arquivo PDF
    return `reports/${fileName}.pdf`;
  }

  private async saveReportRecord(type: ReportType, format: ReportFormat, filters: ReportFilters, filePath: string): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .insert({
        type,
        format,
        filters,
        file_path: filePath,
        created_at: new Date()
      });

    if (error) {
      throw error;
    }
  }

  private processTransactionData(transactions: Transaction[]): ReportData {
    return {
      total_count: transactions.length,
      total_amount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      transactions
    };
  }

  private processReconciliationData(transactions: Transaction[]): ReportData {
    const statusCounts = transactions.reduce((counts, tx) => {
      counts[tx.status] = (counts[tx.status] || 0) + 1;
      return counts;
    }, {} as Record<TransactionStatus, number>);

    return {
      total_count: transactions.length,
      status_counts: statusCounts,
      total_amount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      transactions_by_platform: this.groupTransactionsByPlatform(transactions)
    };
  }

  private processMetricsData(transactions: Transaction[]): ReportData {
    const platform_metrics = this.calculatePlatformMetrics(transactions);
    const time_metrics = this.calculateTimeMetrics(transactions);

    return {
      total_count: transactions.length,
      total_amount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      platform_metrics,
      time_metrics
    };
  }

  private groupTransactionsByPlatform(transactions: Transaction[]): Record<string, {
    count: number;
    total_amount: number;
    transactions: Transaction[];
  }> {
    return transactions.reduce((groups, tx) => {
      if (!groups[tx.platform_id]) {
        groups[tx.platform_id] = {
          count: 0,
          total_amount: 0,
          transactions: []
        };
      }

      groups[tx.platform_id].count++;
      groups[tx.platform_id].total_amount += tx.amount;
      groups[tx.platform_id].transactions.push(tx);

      return groups;
    }, {} as Record<string, {
      count: number;
      total_amount: number;
      transactions: Transaction[];
    }>);
  }

  private calculatePlatformMetrics(transactions: Transaction[]): Record<string, {
    total_transactions: number;
    total_amount: number;
    success_rate: number;
    average_amount: number;
  }> {
    const metrics: Record<string, {
      total_transactions: number;
      total_amount: number;
      success_rate: number;
      average_amount: number;
    }> = {};

    for (const tx of transactions) {
      if (!metrics[tx.platform_id]) {
        metrics[tx.platform_id] = {
          total_transactions: 0,
          total_amount: 0,
          success_rate: 0,
          average_amount: 0
        };
      }

      metrics[tx.platform_id].total_transactions++;
      metrics[tx.platform_id].total_amount += tx.amount;
      if (tx.status === 'completed') {
        metrics[tx.platform_id].success_rate++;
      }
    }

    // Calcular médias e taxas
    for (const platformId in metrics) {
      const platform = metrics[platformId];
      platform.success_rate = (platform.success_rate / platform.total_transactions) * 100;
      platform.average_amount = platform.total_amount / platform.total_transactions;
    }

    return metrics;
  }

  private calculateTimeMetrics(transactions: Transaction[]): {
    hourly: Record<number, { count: number; amount: number }>;
    daily: Record<number, { count: number; amount: number }>;
    monthly: Record<number, { count: number; amount: number }>;
  } {
    const timeMetrics = {
      hourly: {} as Record<number, { count: number; amount: number }>,
      daily: {} as Record<number, { count: number; amount: number }>,
      monthly: {} as Record<number, { count: number; amount: number }>
    };

    for (const tx of transactions) {
      const date = new Date(tx.created_at);
      const hour = date.getHours();
      const day = date.getDate();
      const month = date.getMonth() + 1;

      // Métricas por hora
      if (!timeMetrics.hourly[hour]) {
        timeMetrics.hourly[hour] = { count: 0, amount: 0 };
      }
      timeMetrics.hourly[hour].count++;
      timeMetrics.hourly[hour].amount += tx.amount;

      // Métricas por dia
      if (!timeMetrics.daily[day]) {
        timeMetrics.daily[day] = { count: 0, amount: 0 };
      }
      timeMetrics.daily[day].count++;
      timeMetrics.daily[day].amount += tx.amount;

      // Métricas por mês
      if (!timeMetrics.monthly[month]) {
        timeMetrics.monthly[month] = { count: 0, amount: 0 };
      }
      timeMetrics.monthly[month].count++;
      timeMetrics.monthly[month].amount += tx.amount;
    }

    return timeMetrics;
  }
}