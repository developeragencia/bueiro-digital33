import { supabase } from '../../lib/supabase';
import { Transaction, PaymentPlatform, PlatformConfig } from '../../types/payment';
import { paymentLogger } from './LogService';
import { paymentAuditor } from './AuditService';
import { getPlatformService } from './platforms';

export interface ReconciliationItem {
  id?: string;
  transaction_id: string;
  platform_id: string;
  local_data: Record<string, any>;
  platform_data: Record<string, any>;
  discrepancies: Record<string, any>;
  status: 'pending' | 'matched' | 'mismatched' | 'resolved';
  resolution?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReconciliationReport {
  period: {
    start: string;
    end: string;
  };
  summary: {
    total_transactions: number;
    matched_transactions: number;
    mismatched_transactions: number;
    pending_transactions: number;
    match_rate: number;
  };
  discrepancies: Array<{
    transaction_id: string;
    platform_id: string;
    type: string;
    details: Record<string, any>;
  }>;
}

export interface ReconciliationResult {
  platformId: string;
  startDate: Date;
  endDate: Date;
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  missingTransactions: number;
  totalAmount: number;
  matchedAmount: number;
  unmatchedAmount: number;
  missingAmount: number;
  errors: string[];
}

export class ReconciliationService {
  private readonly table = 'reconciliation_results';

  async reconcile(platform: PlatformConfig, startDate: Date, endDate: Date): Promise<ReconciliationResult> {
    try {
      // Buscar transações do banco de dados
      const { data: dbTransactions, error: dbError } = await supabase
        .from('transactions')
        .select('*')
        .eq('platform_id', platform.platformId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (dbError) {
        throw new Error(`Failed to fetch database transactions: ${dbError.message}`);
      }

      // Buscar transações da plataforma
      const platformTransactions = await this.fetchPlatformTransactions(platform, startDate, endDate);

      // Calcular resultados
      const result = this.calculateReconciliationResult(
        platform.platformId,
        startDate,
        endDate,
        dbTransactions || [],
        platformTransactions
      );

      // Salvar resultado
      await this.saveReconciliationResult(platform.platformId, result);

      return result;
    } catch (error) {
      throw new Error(`Failed to reconcile transactions: ${(error as Error).message}`);
    }
  }

  private calculateReconciliationResult(
    platformId: string,
    startDate: Date,
    endDate: Date,
    dbTransactions: Transaction[],
    platformTransactions: Transaction[]
  ): ReconciliationResult {
    const dbTransactionMap = new Map(dbTransactions.map(t => [t.order_id, t]));
    const platformTransactionMap = new Map(platformTransactions.map(t => [t.order_id, t]));

    let matchedTransactions = 0;
    let unmatchedTransactions = 0;
    let missingTransactions = 0;
    let matchedAmount = 0;
    let unmatchedAmount = 0;
    let missingAmount = 0;
    const errors: string[] = [];

    // Verificar transações do banco de dados
    for (const [orderId, dbTransaction] of dbTransactionMap) {
      const platformTransaction = platformTransactionMap.get(orderId);
      if (platformTransaction) {
        if (dbTransaction.amount === platformTransaction.amount) {
          matchedTransactions++;
          matchedAmount += dbTransaction.amount;
        } else {
          unmatchedTransactions++;
          unmatchedAmount += Math.abs(dbTransaction.amount - platformTransaction.amount);
          errors.push(`Amount mismatch for order ${orderId}: DB=${dbTransaction.amount}, Platform=${platformTransaction.amount}`);
        }
      } else {
        missingTransactions++;
        missingAmount += dbTransaction.amount;
        errors.push(`Transaction ${orderId} exists in DB but not in platform`);
      }
    }

    // Verificar transações da plataforma que não estão no banco
    for (const [orderId, platformTransaction] of platformTransactionMap) {
      if (!dbTransactionMap.has(orderId)) {
        missingTransactions++;
        missingAmount += platformTransaction.amount;
        errors.push(`Transaction ${orderId} exists in platform but not in DB`);
      }
    }

    return {
      platformId,
      startDate,
      endDate,
      totalTransactions: dbTransactions.length + platformTransactions.length,
      matchedTransactions,
      unmatchedTransactions,
      missingTransactions,
      totalAmount: dbTransactions.reduce((sum, t) => sum + t.amount, 0),
      matchedAmount,
      unmatchedAmount,
      missingAmount,
      errors
    };
  }

  private async saveReconciliationResult(platformId: string, result: ReconciliationResult): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .insert([{
        platform_id: platformId,
        start_date: result.startDate,
        end_date: result.endDate,
        total_transactions: result.totalTransactions,
        matched_transactions: result.matchedTransactions,
        unmatched_transactions: result.unmatchedTransactions,
        missing_transactions: result.missingTransactions,
        total_amount: result.totalAmount,
        matched_amount: result.matchedAmount,
        unmatched_amount: result.unmatchedAmount,
        missing_amount: result.missingAmount,
        errors: result.errors
      }]);

    if (error) {
      throw new Error(`Failed to save reconciliation result: ${error.message}`);
    }
  }

  private async fetchPlatformTransactions(platform: PlatformConfig, startDate: Date, endDate: Date): Promise<Transaction[]> {
    // Implementar busca real de transações da plataforma aqui
    // Por enquanto, retorna um array vazio
    return [];
  }
}

export const paymentReconciler = new ReconciliationService(); 