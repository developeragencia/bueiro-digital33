import { PlatformConfig, Transaction, TransactionStatus, Currency, PaymentMethod } from '../../types/payment';
import { BasePlatformService } from './platforms/BasePlatformService';
import { PagarMeService } from './platforms/PagarMeService';
import { MercadoPagoService } from './platforms/MercadoPagoService';
import { ShopifyService } from './platforms/ShopifyService';
import { WooCommerceService } from './platforms/WooCommerceService';
import { VindiService } from './platforms/VindiService';
import { TrayService } from './platforms/TrayService';
import { PepperService } from './platforms/PepperService';
import { FRCService } from './platforms/FRCService';
import { DoppusService } from './platforms/DoppusService';
import { FortPayService } from './platforms/FortPayService';
import { HublaService } from './platforms/HublaService';
import { TictoService } from './platforms/TictoService';
import { KiwifyService } from './platforms/KiwifyService';
import { logger } from '../../utils/logger';

export class PaymentService {
  private services: Map<string, BasePlatformService> = new Map();

  constructor(configs: PlatformConfig[]) {
    this.initializeServices(configs);
  }

  private initializeServices(configs: PlatformConfig[]): void {
    configs.forEach(config => {
      try {
        const service = this.createService(config);
        if (service) {
          this.services.set(config.platform_id, service);
        }
      } catch (error) {
        logger.error(`Failed to initialize service for platform ${config.platform_id}:`, error);
      }
    });
  }

  private createService(config: PlatformConfig): BasePlatformService | null {
    switch (config.platform_type) {
      case 'pagarme':
        return new PagarMeService(config);
      case 'mercadopago':
        return new MercadoPagoService(config);
      case 'shopify':
        return new ShopifyService(config);
      case 'woocommerce':
        return new WooCommerceService(config);
      case 'vindi':
        return new VindiService(config);
      case 'tray':
        return new TrayService(config);
      case 'pepper':
        return new PepperService(config);
      case 'frc':
        return new FRCService(config);
      case 'doppus':
        return new DoppusService(config);
      case 'fortpay':
        return new FortPayService(config);
      case 'hubla':
        return new HublaService(config);
      case 'ticto':
        return new TictoService(config);
      case 'kiwify':
        return new KiwifyService(config);
      default:
        logger.warn(`Unsupported platform type: ${config.platform_type}`);
        return null;
    }
  }

  public async processPayment(
    platformId: string,
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction> {
    const service = this.services.get(platformId);
    if (!service) {
      throw new Error(`Payment service not found for platform ${platformId}`);
    }

    try {
      return await service.processPayment(amount, currency, paymentMethod, paymentData);
    } catch (error) {
      logger.error(`Error processing payment for platform ${platformId}:`, error);
      throw error;
    }
  }

  public async refundTransaction(
    platformId: string,
    transactionId: string,
    amount?: number,
    reason?: string
  ): Promise<Transaction> {
    const service = this.services.get(platformId);
    if (!service) {
      throw new Error(`Payment service not found for platform ${platformId}`);
    }

    try {
      return await service.refundTransaction(transactionId, amount, reason);
    } catch (error) {
      logger.error(`Error refunding transaction for platform ${platformId}:`, error);
      throw error;
    }
  }

  public async getTransaction(platformId: string, transactionId: string): Promise<Transaction> {
    const service = this.services.get(platformId);
    if (!service) {
      throw new Error(`Payment service not found for platform ${platformId}`);
    }

    try {
      return await service.getTransaction(transactionId);
    } catch (error) {
      logger.error(`Error getting transaction for platform ${platformId}:`, error);
      throw error;
    }
  }

  public async getTransactions(
    platformId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Transaction[]> {
    const service = this.services.get(platformId);
    if (!service) {
      throw new Error(`Payment service not found for platform ${platformId}`);
    }

    try {
      return await service.getTransactions(startDate, endDate);
    } catch (error) {
      logger.error(`Error getting transactions for platform ${platformId}:`, error);
      throw error;
    }
  }

  public async getStatus(platformId: string): Promise<TransactionStatus> {
    const service = this.services.get(platformId);
    if (!service) {
      throw new Error(`Payment service not found for platform ${platformId}`);
    }

    try {
      const status = await service.getStatus();
      return status.status;
    } catch (error) {
      logger.error(`Error getting status for platform ${platformId}:`, error);
      throw error;
    }
  }

  public async cancelTransaction(platformId: string, transactionId: string): Promise<Transaction> {
    const service = this.services.get(platformId);
    if (!service) {
      throw new Error(`Payment service not found for platform ${platformId}`);
    }

    try {
      return await service.cancelTransaction(transactionId);
    } catch (error) {
      logger.error(`Error cancelling transaction for platform ${platformId}:`, error);
      throw error;
    }
  }

  public async validateWebhookSignature(
    platformId: string,
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    const service = this.services.get(platformId);
    if (!service) {
      throw new Error(`Payment service not found for platform ${platformId}`);
    }

    try {
      return await service.validateWebhookSignature(signature, payload);
    } catch (error) {
      logger.error(`Error validating webhook signature for platform ${platformId}:`, error);
      return false;
    }
  }
} 