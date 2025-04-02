import { supabase } from '../../lib/supabase';
import { paymentLogger } from './LogService';

export type AuditAction =
  | 'payment.created'
  | 'payment.updated'
  | 'payment.deleted'
  | 'payment.processed'
  | 'payment.refunded'
  | 'platform.integrated'
  | 'platform.updated'
  | 'platform.deleted'
  | 'webhook.received'
  | 'webhook.processed'
  | 'config.updated'
  | 'user.action';

export interface AuditEntry {
  id?: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  user_id?: string;
  platform_id?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export class PaymentAuditService {
  private readonly table = 'payment_audit_logs';

  async log(
    action: AuditAction,
    entityType: string,
    entityId: string,
    changes?: Record<string, any>,
    metadata: {
      user_id?: string;
      platform_id?: string;
      ip_address?: string;
      user_agent?: string;
    } = {}
  ): Promise<void> {
    try {
      const auditEntry: Omit<AuditEntry, 'id' | 'created_at'> = {
        action,
        entity_type: entityType,
        entity_id: entityId,
        changes,
        ...metadata
      };

      const { error } = await supabase
        .from(this.table)
        .insert([auditEntry]);

      if (error) {
        throw error;
      }

      // Registrar no sistema de logs também para redundância
      paymentLogger.info(
        `Audit: ${action} on ${entityType}:${entityId}`,
        { changes, metadata }
      );

    } catch (error) {
      paymentLogger.error(
        'Failed to create audit log',
        error,
        {
          action,
          entityType,
          entityId,
          changes,
          metadata
        }
      );
      throw error;
    }
  }

  async getAuditTrail(
    entityType: string,
    entityId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AuditEntry[]> {
    let query = supabase
      .from(this.table)
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async getUserActions(
    userId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<AuditEntry[]> {
    let query = supabase
      .from(this.table)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async getPlatformActions(
    platformId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<AuditEntry[]> {
    let query = supabase
      .from(this.table)
      .select('*')
      .eq('platform_id', platformId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async searchAuditLogs(query: {
    action?: AuditAction;
    entity_type?: string;
    entity_id?: string;
    user_id?: string;
    platform_id?: string;
    start_date?: string;
    end_date?: string;
    ip_address?: string;
    limit?: number;
  }): Promise<AuditEntry[]> {
    let queryBuilder = supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false });

    if (query.action) {
      queryBuilder = queryBuilder.eq('action', query.action);
    }

    if (query.entity_type) {
      queryBuilder = queryBuilder.eq('entity_type', query.entity_type);
    }

    if (query.entity_id) {
      queryBuilder = queryBuilder.eq('entity_id', query.entity_id);
    }

    if (query.user_id) {
      queryBuilder = queryBuilder.eq('user_id', query.user_id);
    }

    if (query.platform_id) {
      queryBuilder = queryBuilder.eq('platform_id', query.platform_id);
    }

    if (query.start_date) {
      queryBuilder = queryBuilder.gte('created_at', query.start_date);
    }

    if (query.end_date) {
      queryBuilder = queryBuilder.lte('created_at', query.end_date);
    }

    if (query.ip_address) {
      queryBuilder = queryBuilder.eq('ip_address', query.ip_address);
    }

    queryBuilder = queryBuilder.limit(query.limit || 100);

    const { data, error } = await queryBuilder;

    if (error) {
      throw error;
    }

    return data;
  }

  async getRecentActions(limit: number = 50): Promise<AuditEntry[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  }

  async getActionsByType(
    action: AuditAction,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<AuditEntry[]> {
    let query = supabase
      .from(this.table)
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async getSuspiciousActivities(
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<AuditEntry[]> {
    // Implementar lógica para detectar atividades suspeitas
    // Por exemplo:
    // - Múltiplas tentativas de pagamento falhas do mesmo IP
    // - Alterações de configuração em horários não comerciais
    // - Acessos de IPs não usuais
    // - Padrões de comportamento anormal
    return [];
  }

  async cleanupOldAuditLogs(days: number = 365): Promise<void> {
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

  async exportAuditLogs(
    startDate: string,
    endDate: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    if (format === 'csv') {
      // TODO: Implementar conversão para CSV
      return 'data:text/csv;base64,...';
    }

    return JSON.stringify(data, null, 2);
  }
}

export const paymentAuditor = new PaymentAuditService(); 