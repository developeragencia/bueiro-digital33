import { PlatformConfig, Currency } from '../../../types/payment';
import { AppmaxService } from './AppmaxService';
import { CartPandaService } from './CartPandaService';
import { ClickBankService } from './ClickBankService';
import { Digistore24Service } from './Digistore24Service';
import { DoppusService } from './DoppusService';
import { FortPayService } from './FortPayService';
import { FRCService } from './FRCService';
import { HublaService } from './HublaService';
import { KiwifyService } from './KiwifyService';
import { LogzzService } from './LogzzService';
import { MaxWebService } from './MaxWebService';
import { MundPayService } from './MundPayService';
import { NitroService } from './NitroService';
import { PagTrustService } from './PagTrustService';
import { PepperService } from './PepperService';
import { ShopifyService } from './ShopifyService';
import { StrivPayService } from './StrivPayService';
import { SystemeService } from './SystemeService';
import { TictoService } from './TictoService';
import { TwispayService } from './TwispayService';
import { WooCommerceService } from './WooCommerceService';
import { YapayService } from './YapayService';
import { BasePlatformService } from './BasePlatformService';

export function getPlatformService(config: PlatformConfig): BasePlatformService {
  // Ensure required settings are present
  if (!config.settings.apiKey) {
    throw new Error('API Key is required');
  }

  // Set default values
  const platformConfig: PlatformConfig = {
    ...config,
    settings: {
      ...config.settings,
      currency: config.settings.currency || 'BRL' as Currency,
      active: config.settings.active ?? true,
      sandbox: config.settings.sandbox ?? true
    }
  };

  switch (config.type) {
    case 'appmax':
      return new AppmaxService(platformConfig);
    case 'cartpanda':
      return new CartPandaService(platformConfig);
    case 'clickbank':
      return new ClickBankService(platformConfig);
    case 'digistore24':
      return new Digistore24Service(platformConfig);
    case 'doppus':
      return new DoppusService(platformConfig);
    case 'fortpay':
      return new FortPayService(platformConfig);
    case 'frc':
      return new FRCService(platformConfig);
    case 'hubla':
      return new HublaService(platformConfig);
    case 'kiwify':
      return new KiwifyService(platformConfig);
    case 'logzz':
      return new LogzzService(platformConfig);
    case 'maxweb':
      return new MaxWebService(platformConfig);
    case 'mundpay':
      return new MundPayService(platformConfig);
    case 'nitro':
      return new NitroService(platformConfig);
    case 'pagtrust':
      return new PagTrustService(platformConfig);
    case 'pepper':
      return new PepperService(platformConfig);
    case 'shopify':
      return new ShopifyService(platformConfig);
    case 'strivpay':
      return new StrivPayService(platformConfig);
    case 'systeme':
      return new SystemeService(platformConfig);
    case 'ticto':
      return new TictoService(platformConfig);
    case 'twispay':
      return new TwispayService(platformConfig);
    case 'woocommerce':
      return new WooCommerceService(platformConfig);
    case 'yapay':
      return new YapayService(platformConfig);
    default:
      throw new Error(`Unsupported platform type: ${config.type}`);
  }
}

export {
  BasePlatformService,
  AppmaxService,
  CartPandaService,
  ClickBankService,
  Digistore24Service,
  DoppusService,
  FortPayService,
  FRCService,
  HublaService,
  KiwifyService,
  LogzzService,
  MaxWebService,
  MundPayService,
  NitroService,
  PagTrustService,
  PepperService,
  ShopifyService,
  StrivPayService,
  SystemeService,
  TictoService,
  TwispayService,
  WooCommerceService,
  YapayService
}; 