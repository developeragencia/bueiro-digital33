import { supabase } from '../../lib/supabase';
import {
  PaymentPlatform,
  PaymentPlatformType,
  PlatformSettings,
  PlatformStatusData,
  Transaction,
  PlatformConfig,
  PlatformIntegration,
  Currency
} from '../../types/payment';
import { Database } from '../../types/supabase';
import { getPlatformService } from './platforms';
import { BasePlatformService } from './platforms/BasePlatformService';

interface PlatformServiceError extends Error {
  code?: string;
  details?: string;
  statusCode?: number;
}

type PlatformServiceMap = Map<string, BasePlatformService>;

export class PaymentPlatformService {
  private platforms: PlatformServiceMap;

  constructor() {
    this.platforms = new Map();
  }

  private initializePlatform(platform: PaymentPlatform): void {
    if (this.platforms.has(platform.id)) {
      return;
    }

    const config: PlatformConfig = {
      platformId: platform.id,
      name: platform.name,
      type: platform.type,
      settings: platform.settings,
      apiKey: platform.settings.apiKey,
      secretKey: platform.settings.secretKey,
      sandbox: platform.settings.sandbox,
      metadata: platform.metadata,
      currency: platform.settings.currency,
      active: platform.active
    };

    const service = getPlatformService(platform.type, config);
    this.platforms.set(platform.id, service);
  }

  private getPlatformService(platform: PaymentPlatform): BasePlatformService {
    this.initializePlatform(platform);
    const service = this.platforms.get(platform.id);
    if (!service) {
      const error = new Error(`Platform ${platform.id} not initialized`) as PlatformServiceError;
      error.code = 'PLATFORM_NOT_INITIALIZED';
      throw error;
    }
    return service;
  }

  async processPayment(
    platform: PaymentPlatform,
    amount: number,
    currency: Currency,
    customer: Transaction['customer'],
    metadata?: Record<string, any>
  ): Promise<Transaction> {
    const service = this.getPlatformService(platform);
    return service.processPayment(amount, currency, customer, metadata);
  }

  async processRefund(
    platform: PaymentPlatform,
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction> {
    const service = this.getPlatformService(platform);
    return service.processRefund(transactionId, amount, reason);
  }

  async validateWebhook(
    platform: PaymentPlatform,
    payload: Record<string, any>,
    signature: string
  ): Promise<boolean> {
    const service = this.getPlatformService(platform);
    return service.validateWebhook(payload, signature);
  }

  async getTransaction(
    platform: PaymentPlatform,
    transactionId: string
  ): Promise<Transaction> {
    const service = this.getPlatformService(platform);
    return service.getTransaction(transactionId);
  }

  async getTransactions(
    platform: PaymentPlatform,
    startDate?: Date,
    endDate?: Date
  ): Promise<Transaction[]> {
    const service = this.getPlatformService(platform);
    return service.getTransactions(startDate, endDate);
  }

  async getStatus(platform: PaymentPlatform): Promise<PlatformStatusData> {
    const service = this.getPlatformService(platform);
    return service.getStatus();
  }

  async updateConfig(
    platform: PaymentPlatform,
    config: Partial<PlatformConfig>
  ): Promise<void> {
    const service = this.getPlatformService(platform);
    await service.updateConfig(config);
  }

  private createError(message: string, code: string, statusCode?: number): PlatformServiceError {
    const error = new Error(message) as PlatformServiceError;
    error.code = code;
    if (statusCode) error.statusCode = statusCode;
    return error;
  }
}

export const paymentPlatformService = new PaymentPlatformService();
 