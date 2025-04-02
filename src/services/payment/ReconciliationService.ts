import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/payment';
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

export class PaymentReconciliationService {
  private readonly reconciliationsTable = 'payment_reconciliations';
  private readonly transactionsTable = 'transactions';

  async reconcileTransactions(
    startDate: string,
    endDate: string,
    platformId?: string
  ): Promise<ReconciliationReport> {
    try {
      // Buscar transações locais
      const localTransactions = await this.getLocalTransactions(startDate, endDate, platformId);

      // Inicializar contadores para o relatório
      const summary = {
        total_transactions: localTransactions.length,
        matched_transactions: 0,
        mismatched_transactions: 0,
        pending_transactions: 0,
        match_rate: 0
      };

      const discrepancies: ReconciliationReport['discrepancies'] = [];

      // Processar cada transação
      for (const transaction of localTransactions) {
        const reconciliationItem = await this.reconcileTransaction(transaction);

        // Atualizar contadores
        switch (reconciliationItem.status) {
          case 'matched':
            summary.matched_transactions++;
            break;
          case 'mismatched':
            summary.mismatched_transactions++;
            if (reconciliationItem.discrepancies) {
              discrepancies.push({
                transaction_id: transaction.id!,
                platform_id: transaction.platform_id,
                type: 'data_mismatch',
                details: reconciliationItem.discrepancies
              });
            }
            break;
          case 'pending':
            summary.pending_transactions++;
            break;
        }
      }

      // Calcular taxa de correspondência
      summary.match_rate = summary.total_transactions > 0
        ? (summary.matched_transactions / summary.total_transactions) * 100
        : 0;

      return {
        period: { start: startDate, end: endDate },
        summary,
        discrepancies
      };

    } catch (error) {
      paymentLogger.error(
        'Failed to reconcile transactions',
        error,
        { startDate, endDate, platformId }
      );
      throw error;
    }
  }

  private async getLocalTransactions(
    startDate: string,
    endDate: string,
    platformId?: string
  ): Promise<Transaction[]> {
    let query = supabase
      .from(this.transactionsTable)
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  private async reconcileTransaction(transaction: Transaction): Promise<ReconciliationItem> {
    try {
      // Buscar dados da plataforma
      const platformService = getPlatformService(transaction.platform_type, {
        apiKey: transaction.platform_settings.apiKey,
        secretKey: transaction.platform_settings.secretKey,
        sandbox: transaction.platform_settings.sandbox || false
      });

      const platformData = await platformService.getTransaction(transaction.order_id);

      // Comparar dados
      const discrepancies = this.compareTransactionData(transaction, platformData);

      // Determinar status
      const status = Object.keys(discrepancies).length === 0 ? 'matched' : 'mismatched';

      // Criar ou atualizar item de reconciliação
      const reconciliationItem: Omit<ReconciliationItem, 'id' | 'created_at' | 'updated_at'> = {
        transaction_id: transaction.id!,
        platform_id: transaction.platform_id,
        local_data: this.sanitizeTransactionData(transaction),
        platform_data: this.sanitizeTransactionData(platformData),
        discrepancies,
        status
      };

      const { data: savedItem, error } = await supabase
        .from(this.reconciliationsTable)
        .upsert([reconciliationItem], {
          onConflict: 'transaction_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Se houver discrepâncias, registrar na auditoria
      if (status === 'mismatched') {
        await paymentAuditor.log(
          'payment.reconciliation' as any,
          'transaction',
          transaction.id!,
          {
            discrepancies,
            platform_data: platformData
          },
          {
            platform_id: transaction.platform_id
          }
        );
      }

      return savedItem;

    } catch (error) {
      paymentLogger.error(
        'Failed to reconcile transaction',
        error,
        { transaction_id: transaction.id }
      );

      // Em caso de erro, criar item de reconciliação pendente
      const reconciliationItem: Omit<ReconciliationItem, 'id' | 'created_at' | 'updated_at'> = {
        transaction_id: transaction.id!,
        platform_id: transaction.platform_id,
        local_data: this.sanitizeTransactionData(transaction),
        platform_data: {},
        discrepancies: {},
        status: 'pending'
      };

      const { data: savedItem, error: saveError } = await supabase
        .from(this.reconciliationsTable)
        .upsert([reconciliationItem], {
          onConflict: 'transaction_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      return savedItem;
    }
  }

  private compareTransactionData(
    localData: Transaction,
    platformData: Record<string, any>
  ): Record<string, any> {
    const discrepancies: Record<string, any> = {};

    // Campos a serem comparados
    const fieldsToCompare = {
      amount: 'amount',
      currency: 'currency',
      status: 'status',
      payment_method: 'payment_method'
    };

    // Comparar campos
    for (const [localField, platformField] of Object.entries(fieldsToCompare)) {
      if (localData[localField] !== platformData[platformField]) {
        discrepancies[localField] = {
          local: localData[localField],
          platform: platformData[platformField]
        };
      }
    }

    // Comparar dados do cliente
    if (localData.customer && platformData.customer) {
      const customerDiscrepancies = this.compareCustomerData(
        localData.customer,
        platformData.customer
      );
      if (Object.keys(customerDiscrepancies).length > 0) {
        discrepancies.customer = customerDiscrepancies;
      }
    }

    return discrepancies;
  }

  private compareCustomerData(
    localCustomer: Record<string, any>,
    platformCustomer: Record<string, any>
  ): Record<string, any> {
    const discrepancies: Record<string, any> = {};
    const fieldsToCompare = ['name', 'email', 'phone', 'document'];

    for (const field of fieldsToCompare) {
      if (localCustomer[field] !== platformCustomer[field]) {
        discrepancies[field] = {
          local: localCustomer[field],
          platform: platformCustomer[field]
        };
      }
    }

    return discrepancies;
  }

  private sanitizeTransactionData(data: Record<string, any>): Record<string, any> {
    // Remover campos sensíveis e desnecessários
    const sanitized = { ...data };
    delete sanitized.platform_settings;
    delete sanitized.metadata?.platform_settings;
    delete sanitized.metadata?.sensitive_data;
    return sanitized;
  }

  async resolveDiscrepancy(
    transactionId: string,
    resolution: string,
    updates?: Record<string, any>
  ): Promise<void> {
    try {
      // Atualizar item de reconciliação
      const { error: reconciliationError } = await supabase
        .from(this.reconciliationsTable)
        .update({
          status: 'resolved',
          resolution,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);

      if (reconciliationError) {
        throw reconciliationError;
      }

      // Se houver atualizações para aplicar
      if (updates) {
        const { error: transactionError } = await supabase
          .from(this.transactionsTable)
          .update(updates)
          .eq('id', transactionId);

        if (transactionError) {
          throw transactionError;
        }

        // Registrar na auditoria
        await paymentAuditor.log(
          'payment.reconciliation.resolved' as any,
          'transaction',
          transactionId,
          {
            resolution,
            updates
          }
        );
      }

    } catch (error) {
      paymentLogger.error(
        'Failed to resolve discrepancy',
        error,
        { transactionId, resolution, updates }
      );
      throw error;
    }
  }

  async getReconciliationStatus(
    transactionId: string
  ): Promise<ReconciliationItem | null> {
    const { data, error } = await supabase
      .from(this.reconciliationsTable)
      .select('*')
      .eq('transaction_id', transactionId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getPendingReconciliations(
    platformId?: string,
    limit: number = 100
  ): Promise<ReconciliationItem[]> {
    let query = supabase
      .from(this.reconciliationsTable)
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async getMismatchedReconciliations(
    platformId?: string,
    limit: number = 100
  ): Promise<ReconciliationItem[]> {
    let query = supabase
      .from(this.reconciliationsTable)
      .select('*')
      .eq('status', 'mismatched')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async generateReconciliationReport(
    startDate: string,
    endDate: string,
    platformId?: string
  ): Promise<ReconciliationReport> {
    return this.reconcileTransactions(startDate, endDate, platformId);
  }

  async cleanupOldReconciliations(days: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { error } = await supabase
      .from(this.reconciliationsTable)
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw error;
    }
  }
}

export const paymentReconciler = new PaymentReconciliationService(); 