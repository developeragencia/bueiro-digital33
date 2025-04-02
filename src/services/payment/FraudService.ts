import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types/payment';
import { paymentLogger } from './LogService';
import { paymentAuditor } from './AuditService';

export interface FraudRule {
  id?: string;
  name: string;
  description: string;
  type: 'transaction' | 'user' | 'device' | 'location' | 'pattern';
  conditions: Record<string, any>;
  score: number;
  action: 'flag' | 'block' | 'review';
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FraudCheck {
  id?: string;
  transaction_id: string;
  user_id?: string;
  platform_id: string;
  rules_triggered: string[];
  total_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  action_taken: 'allowed' | 'flagged' | 'blocked' | 'reviewed';
  metadata: Record<string, any>;
  created_at?: string;
}

export interface DeviceFingerprint {
  id?: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  browser: string;
  os: string;
  device_type: string;
  screen_resolution?: string;
  timezone?: string;
  language?: string;
  canvas_fingerprint?: string;
  webgl_fingerprint?: string;
  audio_fingerprint?: string;
  fonts_fingerprint?: string;
  plugins_fingerprint?: string;
  created_at?: string;
}

export class PaymentFraudService {
  private readonly rulesTable = 'fraud_rules';
  private readonly checksTable = 'fraud_checks';
  private readonly deviceFingerprintsTable = 'device_fingerprints';

  async analyzeTransaction(
    transaction: Transaction,
    deviceFingerprint: Partial<DeviceFingerprint>
  ): Promise<FraudCheck> {
    try {
      // Buscar regras ativas
      const rules = await this.getActiveRules();

      // Calcular pontuação de risco
      const { triggeredRules, totalScore } = await this.evaluateRules(
        rules,
        transaction,
        deviceFingerprint
      );

      // Determinar nível de risco
      const riskLevel = this.calculateRiskLevel(totalScore);

      // Determinar ação a ser tomada
      const actionTaken = this.determineAction(riskLevel, triggeredRules);

      // Criar registro de verificação
      const fraudCheck: Omit<FraudCheck, 'id' | 'created_at'> = {
        transaction_id: transaction.id!,
        user_id: transaction.user_id,
        platform_id: transaction.platform_id,
        rules_triggered: triggeredRules.map(rule => rule.id!),
        total_score: totalScore,
        risk_level: riskLevel,
        action_taken: actionTaken,
        metadata: {
          device_fingerprint: deviceFingerprint,
          triggered_rules_details: triggeredRules
        }
      };

      const { data: savedCheck, error } = await supabase
        .from(this.checksTable)
        .insert([fraudCheck])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Registrar no sistema de auditoria
      await paymentAuditor.log(
        'payment.fraud_check' as any,
        'transaction',
        transaction.id!,
        {
          risk_level: riskLevel,
          action_taken: actionTaken,
          total_score: totalScore
        },
        {
          user_id: transaction.user_id,
          platform_id: transaction.platform_id
        }
      );

      return savedCheck;

    } catch (error) {
      paymentLogger.error(
        'Failed to analyze transaction for fraud',
        error,
        { transaction_id: transaction.id }
      );
      throw error;
    }
  }

  private async getActiveRules(): Promise<FraudRule[]> {
    const { data, error } = await supabase
      .from(this.rulesTable)
      .select('*')
      .eq('enabled', true)
      .order('score', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  private async evaluateRules(
    rules: FraudRule[],
    transaction: Transaction,
    deviceFingerprint: Partial<DeviceFingerprint>
  ): Promise<{ triggeredRules: FraudRule[]; totalScore: number }> {
    const triggeredRules: FraudRule[] = [];
    let totalScore = 0;

    for (const rule of rules) {
      const triggered = await this.evaluateRule(rule, transaction, deviceFingerprint);
      if (triggered) {
        triggeredRules.push(rule);
        totalScore += rule.score;
      }
    }

    return { triggeredRules, totalScore };
  }

  private async evaluateRule(
    rule: FraudRule,
    transaction: Transaction,
    deviceFingerprint: Partial<DeviceFingerprint>
  ): Promise<boolean> {
    try {
      switch (rule.type) {
        case 'transaction':
          return this.evaluateTransactionRule(rule, transaction);
        case 'user':
          return this.evaluateUserRule(rule, transaction);
        case 'device':
          return this.evaluateDeviceRule(rule, deviceFingerprint);
        case 'location':
          return this.evaluateLocationRule(rule, deviceFingerprint);
        case 'pattern':
          return this.evaluatePatternRule(rule, transaction, deviceFingerprint);
        default:
          return false;
      }
    } catch (error) {
      paymentLogger.error(
        'Failed to evaluate fraud rule',
        error,
        { rule, transaction_id: transaction.id }
      );
      return false;
    }
  }

  private async evaluateTransactionRule(rule: FraudRule, transaction: Transaction): Promise<boolean> {
    const conditions = rule.conditions;

    // Verificar valor da transação
    if (conditions.amount_threshold && transaction.amount > conditions.amount_threshold) {
      return true;
    }

    // Verificar moeda
    if (conditions.currencies && !conditions.currencies.includes(transaction.currency)) {
      return true;
    }

    // Verificar método de pagamento
    if (conditions.payment_methods && !conditions.payment_methods.includes(transaction.payment_method)) {
      return true;
    }

    return false;
  }

  private async evaluateUserRule(rule: FraudRule, transaction: Transaction): Promise<boolean> {
    if (!transaction.user_id) return false;

    const conditions = rule.conditions;
    const timeWindow = conditions.time_window || '24h';
    const startDate = this.getDateFromTimeWindow(timeWindow);

    // Buscar transações recentes do usuário
    const { data: userTransactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', transaction.user_id)
      .gte('created_at', startDate.toISOString());

    if (error) {
      throw error;
    }

    // Verificar limite de transações
    if (conditions.max_transactions && userTransactions.length >= conditions.max_transactions) {
      return true;
    }

    // Verificar valor total das transações
    const totalAmount = userTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    if (conditions.max_total_amount && totalAmount >= conditions.max_total_amount) {
      return true;
    }

    return false;
  }

  private async evaluateDeviceRule(rule: FraudRule, deviceFingerprint: Partial<DeviceFingerprint>): Promise<boolean> {
    const conditions = rule.conditions;

    // Verificar dispositivos conhecidos
    if (conditions.known_devices) {
      const { data: knownDevices, error } = await supabase
        .from(this.deviceFingerprintsTable)
        .select('*')
        .eq('user_id', deviceFingerprint.user_id)
        .eq('ip_address', deviceFingerprint.ip_address);

      if (error) {
        throw error;
      }

      if (knownDevices.length === 0) {
        return true;
      }
    }

    // Verificar múltiplos dispositivos
    if (conditions.max_devices) {
      const { data: userDevices, error } = await supabase
        .from(this.deviceFingerprintsTable)
        .select('ip_address')
        .eq('user_id', deviceFingerprint.user_id);

      if (error) {
        throw error;
      }

      // Contar IPs únicos manualmente
      const uniqueIps = new Set(userDevices.map(d => d.ip_address));
      if (uniqueIps.size >= conditions.max_devices) {
        return true;
      }
    }

    return false;
  }

  private async evaluateLocationRule(rule: FraudRule, deviceFingerprint: Partial<DeviceFingerprint>): Promise<boolean> {
    const conditions = rule.conditions;

    // TODO: Implementar verificação de localização usando serviço de geolocalização
    // - Verificar países de alto risco
    // - Verificar distância entre transações
    // - Verificar velocidade de deslocamento
    return false;
  }

  private async evaluatePatternRule(
    rule: FraudRule,
    transaction: Transaction,
    deviceFingerprint: Partial<DeviceFingerprint>
  ): Promise<boolean> {
    const conditions = rule.conditions;
    const timeWindow = conditions.time_window || '1h';
    const startDate = this.getDateFromTimeWindow(timeWindow);

    // Buscar transações recentes com padrões similares
    let query = supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (conditions.same_amount) {
      query = query.eq('amount', transaction.amount);
    }

    if (conditions.same_currency) {
      query = query.eq('currency', transaction.currency);
    }

    if (conditions.same_payment_method) {
      query = query.eq('payment_method', transaction.payment_method);
    }

    const { data: similarTransactions, error } = await query;

    if (error) {
      throw error;
    }

    // Verificar limite de padrões similares
    if (conditions.max_similar_transactions && similarTransactions.length >= conditions.max_similar_transactions) {
      return true;
    }

    return false;
  }

  private calculateRiskLevel(score: number): FraudCheck['risk_level'] {
    if (score >= 100) {
      return 'critical';
    } else if (score >= 70) {
      return 'high';
    } else if (score >= 40) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private determineAction(
    riskLevel: FraudCheck['risk_level'],
    triggeredRules: FraudRule[]
  ): FraudCheck['action_taken'] {
    // Se alguma regra exige bloqueio, bloquear
    if (triggeredRules.some(rule => rule.action === 'block')) {
      return 'blocked';
    }

    // Se alguma regra exige revisão, marcar para revisão
    if (triggeredRules.some(rule => rule.action === 'review')) {
      return 'reviewed';
    }

    // Caso contrário, basear na pontuação de risco
    switch (riskLevel) {
      case 'critical':
        return 'blocked';
      case 'high':
        return 'reviewed';
      case 'medium':
        return 'flagged';
      default:
        return 'allowed';
    }
  }

  private getDateFromTimeWindow(timeWindow: string): Date {
    const now = new Date();
    const value = parseInt(timeWindow);
    const unit = timeWindow.slice(-1);

    switch (unit) {
      case 'h':
        now.setHours(now.getHours() - value);
        break;
      case 'd':
        now.setDate(now.getDate() - value);
        break;
      case 'w':
        now.setDate(now.getDate() - (value * 7));
        break;
      case 'm':
        now.setMonth(now.getMonth() - value);
        break;
    }

    return now;
  }

  async createRule(rule: Omit<FraudRule, 'id' | 'created_at' | 'updated_at'>): Promise<FraudRule> {
    const { data, error } = await supabase
      .from(this.rulesTable)
      .insert([rule])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async updateRule(
    ruleId: string,
    updates: Partial<Omit<FraudRule, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<FraudRule> {
    const { data, error } = await supabase
      .from(this.rulesTable)
      .update(updates)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async deleteRule(ruleId: string): Promise<void> {
    const { error } = await supabase
      .from(this.rulesTable)
      .delete()
      .eq('id', ruleId);

    if (error) {
      throw error;
    }
  }

  async getFraudChecks(
    transactionId?: string,
    userId?: string,
    platformId?: string,
    startDate?: string,
    endDate?: string,
    limit: number = 100
  ): Promise<FraudCheck[]> {
    let query = supabase
      .from(this.checksTable)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (transactionId) {
      query = query.eq('transaction_id', transactionId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

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

  async saveDeviceFingerprint(fingerprint: Omit<DeviceFingerprint, 'id' | 'created_at'>): Promise<DeviceFingerprint> {
    const { data, error } = await supabase
      .from(this.deviceFingerprintsTable)
      .insert([fingerprint])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getDeviceFingerprints(
    userId?: string,
    ipAddress?: string,
    limit: number = 100
  ): Promise<DeviceFingerprint[]> {
    let query = supabase
      .from(this.deviceFingerprintsTable)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (ipAddress) {
      query = query.eq('ip_address', ipAddress);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return data;
  }

  async generateFraudReport(
    startDate: string,
    endDate: string,
    platformId?: string
  ): Promise<Record<string, any>> {
    const fraudChecks = await this.getFraudChecks(
      undefined,
      undefined,
      platformId,
      startDate,
      endDate
    );

    const totalChecks = fraudChecks.length;
    const blockedTransactions = fraudChecks.filter(check => check.action_taken === 'blocked').length;
    const flaggedTransactions = fraudChecks.filter(check => check.action_taken === 'flagged').length;
    const reviewedTransactions = fraudChecks.filter(check => check.action_taken === 'reviewed').length;

    const riskLevelDistribution = fraudChecks.reduce((acc, check) => {
      acc[check.risk_level] = (acc[check.risk_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const triggeredRules = fraudChecks.reduce((acc, check) => {
      check.rules_triggered.forEach(ruleId => {
        acc[ruleId] = (acc[ruleId] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      period: {
        start: startDate,
        end: endDate
      },
      summary: {
        total_checks: totalChecks,
        blocked_transactions: blockedTransactions,
        flagged_transactions: flaggedTransactions,
        reviewed_transactions: reviewedTransactions,
        block_rate: totalChecks > 0 ? (blockedTransactions / totalChecks) * 100 : 0,
        flag_rate: totalChecks > 0 ? (flaggedTransactions / totalChecks) * 100 : 0,
        review_rate: totalChecks > 0 ? (reviewedTransactions / totalChecks) * 100 : 0
      },
      risk_level_distribution: riskLevelDistribution,
      triggered_rules: triggeredRules
    };
  }
}

export const fraudAnalyzer = new PaymentFraudService(); 