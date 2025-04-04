import { PlatformConfig } from '../../../types/payment';
import { BasePlatformService } from './BasePlatformService';
import { MundPayService } from './MundPayService';
import { MaxWebService } from './MaxWebService';
import { LogzzService } from './LogzzService';
import { SystemeService } from './SystemeService';
import { TictoService } from './TictoService';
import { WooCommerceService } from './WooCommerceService';
import { ShopifyService } from './ShopifyService';
import { PepperService } from './PepperService';
import { PagTrustService } from './PagTrustService';
import { HublaService } from './HublaService';
import { KiwifyService } from './KiwifyService';
import { FRCService } from './FRCService';

export function createPlatformService(config: PlatformConfig): BasePlatformService {
  if (!config.settings) {
    throw new Error('Configurações da plataforma não fornecidas');
  }

  if (!config.settings.apiKey || !config.settings.secretKey) {
    throw new Error('API Key e Secret Key são obrigatórios');
  }

  switch (config.platform_id) {
    case 'mundpay':
      return new MundPayService(config);
    case 'maxweb':
      return new MaxWebService(config);
    case 'logzz':
      return new LogzzService(config);
    case 'systeme':
      return new SystemeService(config);
    case 'ticto':
      return new TictoService(config);
    case 'woocommerce':
      return new WooCommerceService(config);
    case 'shopify':
      return new ShopifyService(config);
    case 'pepper':
      return new PepperService(config);
    case 'pagtrust':
      return new PagTrustService(config);
    case 'hubla':
      return new HublaService(config);
    case 'kiwify':
      return new KiwifyService(config);
    case 'frc':
      return new FRCService(config);
    default:
      throw new Error(`Plataforma não suportada: ${config.platform_id}`);
  }
} 