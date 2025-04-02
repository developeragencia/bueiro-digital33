import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/payment';
import { paymentLogger } from './LogService';
import { paymentMetrics } from './MetricsService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ReportType = 
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

export type ReportFormat = 'json' | 'csv' | 'pdf' | 'excel';

export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  startDate?: string;
  endDate?: string;
  platformId?: string;
  userId?: string;
  includeMetrics?: boolean;
  includeTrends?: boolean;
  includeCharts?: boolean;
}

export interface Report {
  id?: string;
  config: ReportConfig;
  data: Record<string, any>;
  file_url?: string;
  created_at?: string;
  generated_at?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export class PaymentReportService {
  private readonly reportsTable = 'payment_reports';
  private readonly transactionsTable = 'transactions';

  async generateReport(config: ReportConfig): Promise<Report> {
    try {
      // Criar registro do relatório
      const report: Omit<Report, 'id'> = {
        config,
        data: {},
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const { data: savedReport, error: saveError } = await supabase
        .from(this.reportsTable)
        .insert([report])
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      // Iniciar geração do relatório
      await this.updateReportStatus(savedReport.id, 'processing');

      const reportData = await this.processReport(config);

      // Gerar arquivo do relatório no formato solicitado
      const fileUrl = await this.generateReportFile(reportData, config.format);

      // Atualizar relatório com os dados e status
      const { error: updateError } = await supabase
        .from(this.reportsTable)
        .update({
          data: reportData,
          file_url: fileUrl,
          status: 'completed',
          generated_at: new Date().toISOString()
        })
        .eq('id', savedReport.id);

      if (updateError) {
        throw updateError;
      }

      return {
        ...savedReport,
        data: reportData,
        file_url: fileUrl,
        status: 'completed',
        generated_at: new Date().toISOString()
      };

    } catch (error) {
      paymentLogger.error(
        'Failed to generate report',
        error,
        { config }
      );

      if (error instanceof Error) {
        await this.updateReportStatus(error.message, 'failed', error.message);
      }

      throw error;
    }
  }

  private async processReport(config: ReportConfig): Promise<Record<string, any>> {
    const { startDate, endDate } = this.getDateRange(config.type, config.startDate, config.endDate);

    // Buscar transações do período
    const transactions = await this.getTransactions(startDate, endDate, config.platformId, config.userId);

    // Dados básicos do relatório
    const reportData: Record<string, any> = {
      period: {
        start: startDate,
        end: endDate,
        type: config.type
      },
      summary: this.generateTransactionsSummary(transactions),
      transactions: this.formatTransactions(transactions)
    };

    // Adicionar métricas se solicitado
    if (config.includeMetrics) {
      reportData.metrics = await paymentMetrics.calculateTransactionMetrics(
        startDate,
        endDate,
        config.platformId,
        config.userId
      );
    }

    // Adicionar análise de tendências se solicitado
    if (config.includeTrends) {
      const days = this.getDaysForReportType(config.type);
      reportData.trends = await paymentMetrics.analyzeTransactionTrends(days);
    }

    // Adicionar dados para gráficos se solicitado
    if (config.includeCharts) {
      reportData.charts = this.generateChartsData(transactions);
    }

    return reportData;
  }

  private getDateRange(type: ReportType, startDate?: string, endDate?: string): { startDate: string; endDate: string } {
    if (type === 'custom' && startDate && endDate) {
      return { startDate, endDate };
    }

    const end = new Date();
    let start = new Date();

    switch (type) {
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarterly':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'yearly':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  }

  private getDaysForReportType(type: ReportType): number {
    switch (type) {
      case 'daily':
        return 1;
      case 'weekly':
        return 7;
      case 'monthly':
        return 30;
      case 'quarterly':
        return 90;
      case 'yearly':
        return 365;
      default:
        return 30;
    }
  }

  private async getTransactions(
    startDate: string,
    endDate: string,
    platformId?: string,
    userId?: string
  ): Promise<Transaction[]> {
    let query = supabase
      .from(this.transactionsTable)
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  private generateTransactionsSummary(transactions: Transaction[]): Record<string, any> {
    return {
      total_count: transactions.length,
      total_amount: transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      status_breakdown: this.groupTransactionsByStatus(transactions),
      payment_methods: this.groupTransactionsByPaymentMethod(transactions)
    };
  }

  private groupTransactionsByStatus(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce((acc, tx) => {
      acc[tx.status] = (acc[tx.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupTransactionsByPaymentMethod(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce((acc, tx) => {
      if (tx.payment_method) {
        acc[tx.payment_method] = (acc[tx.payment_method] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  private formatTransactions(transactions: Transaction[]): Record<string, any>[] {
    return transactions.map(tx => ({
      id: tx.id,
      order_id: tx.order_id,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      payment_method: tx.payment_method,
      customer: tx.customer,
      created_at: format(new Date(tx.created_at), 'PPpp', { locale: ptBR }),
      platform_id: tx.platform_id
    }));
  }

  private generateChartsData(transactions: Transaction[]): Record<string, any> {
    const dailyVolume = this.calculateDailyVolume(transactions);
    const statusDistribution = this.groupTransactionsByStatus(transactions);
    const paymentMethodDistribution = this.groupTransactionsByPaymentMethod(transactions);

    return {
      daily_volume: dailyVolume,
      status_distribution: statusDistribution,
      payment_method_distribution: paymentMethodDistribution
    };
  }

  private calculateDailyVolume(transactions: Transaction[]): Record<string, any>[] {
    const dailyVolume = transactions.reduce((acc, tx) => {
      const date = format(new Date(tx.created_at), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          amount: 0
        };
      }
      acc[date].count++;
      acc[date].amount += tx.amount || 0;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    return Object.entries(dailyVolume).map(([date, data]) => ({
      date,
      ...data
    }));
  }

  private async generateReportFile(data: Record<string, any>, format: ReportFormat): Promise<string> {
    // TODO: Implementar geração de arquivos nos formatos solicitados
    // Por enquanto, apenas simula a geração retornando uma URL fictícia
    return `https://storage.example.com/reports/${Date.now()}.${format}`;
  }

  private async updateReportStatus(
    reportId: string,
    status: Report['status'],
    error?: string
  ): Promise<void> {
    const { error: updateError } = await supabase
      .from(this.reportsTable)
      .update({
        status,
        error,
        ...(status === 'completed' ? { generated_at: new Date().toISOString() } : {})
      })
      .eq('id', reportId);

    if (updateError) {
      throw updateError;
    }
  }

  async getReport(reportId: string): Promise<Report> {
    const { data, error } = await supabase
      .from(this.reportsTable)
      .select('*')
      .eq('id', reportId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async listReports(
    type?: ReportType,
    status?: Report['status'],
    limit: number = 100
  ): Promise<Report[]> {
    let query = supabase
      .from(this.reportsTable)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type) {
      query = query.eq('config->type', type);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteReport(reportId: string): Promise<void> {
    const { error } = await supabase
      .from(this.reportsTable)
      .delete()
      .eq('id', reportId);

    if (error) {
      throw error;
    }
  }

  async cleanupOldReports(days: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { error } = await supabase
      .from(this.reportsTable)
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw error;
    }
  }
}

export const paymentReporter = new PaymentReportService();