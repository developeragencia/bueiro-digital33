import { PlatformConfig, Transaction, TransactionStatus, Currency, PaymentMethod, PaymentPlatform } from '../../types/payment';
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
import { getPlatformService } from './platforms';

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
    platform: PaymentPlatform,
    amount: number,
    currency: Currency,
    paymentMethod: PaymentMethod,
    paymentData: Record<string, any>
  ): Promise<Transaction> {
    const service = getPlatformService(platform, {
      id: platform,
      name: platform,
      platform,
      settings: {
        apiKey: process.env.VITE_PAYMENT_API_KEY || '',
        secretKey: process.env.VITE_PAYMENT_SECRET_KEY || '',
        webhookSecret: process.env.VITE_PAYMENT_WEBHOOK_SECRET,
        sandbox: process.env.NODE_ENV !== 'production'
      },
      enabled: true
    });

    return service.processPayment(amount, currency, paymentMethod, paymentData);
  }

  public async refundTransaction(
    platform: PaymentPlatform,
    transactionId: string,
    amount?: number
  ): Promise<Transaction> {
    const service = getPlatformService(platform, {
      id: platform,
      name: platform,
      platform,
      settings: {
        apiKey: process.env.VITE_PAYMENT_API_KEY || '',
        secretKey: process.env.VITE_PAYMENT_SECRET_KEY || '',
        webhookSecret: process.env.VITE_PAYMENT_WEBHOOK_SECRET,
        sandbox: process.env.NODE_ENV !== 'production'
      },
      enabled: true
    });

    return service.refundTransaction(transactionId, amount);
  }

  public async getTransaction(
    platform: PaymentPlatform,
    transactionId: string
  ): Promise<Transaction> {
    const service = getPlatformService(platform, {
      id: platform,
      name: platform,
      platform,
      settings: {
        apiKey: process.env.VITE_PAYMENT_API_KEY || '',
        secretKey: process.env.VITE_PAYMENT_SECRET_KEY || '',
        webhookSecret: process.env.VITE_PAYMENT_WEBHOOK_SECRET,
        sandbox: process.env.NODE_ENV !== 'production'
      },
      enabled: true
    });

    return service.getTransaction(transactionId);
  }

  public async getTransactions(
    platform: PaymentPlatform,
    startDate?: Date,
    endDate?: Date
  ): Promise<Transaction[]> {
    const service = getPlatformService(platform, {
      id: platform,
      name: platform,
      platform,
      settings: {
        apiKey: process.env.VITE_PAYMENT_API_KEY || '',
        secretKey: process.env.VITE_PAYMENT_SECRET_KEY || '',
        webhookSecret: process.env.VITE_PAYMENT_WEBHOOK_SECRET,
        sandbox: process.env.NODE_ENV !== 'production'
      },
      enabled: true
    });

    return service.getTransactions(startDate, endDate);
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
    platform: PaymentPlatform,
    signature: string,
    payload: Record<string, any>
  ): Promise<boolean> {
    const service = getPlatformService(platform, {
      id: platform,
      name: platform,
      platform,
      settings: {
        apiKey: process.env.VITE_PAYMENT_API_KEY || '',
        secretKey: process.env.VITE_PAYMENT_SECRET_KEY || '',
        webhookSecret: process.env.VITE_PAYMENT_WEBHOOK_SECRET,
        sandbox: process.env.NODE_ENV !== 'production'
      },
      enabled: true
    });

    return service.validateWebhookSignature(signature, payload);
  }
} 