import { PaymentPlatform, PaymentPlatformConfig } from '../../../types/payment';
import { ShopifyService } from './ShopifyService';
import { SystemeService } from './SystemeService';
import { StrivPayService } from './StrivPayService';
import { AppmaxService } from './AppmaxService';
import { PepperService } from './PepperService';
import { LogzzService } from './LogzzService';
import { MaxWebService } from './MaxWebService';
import { Digistore24Service } from './Digistore24Service';
import { FortPayService } from './FortPayService';
import { ClickBankService } from './ClickBankService';
import { CartPandaService } from './CartPandaService';
import { DoppusService } from './DoppusService';
import { NitroService } from './NitroService';
import { MundPayService } from './MundPayService';
import { PagTrustService } from './PagTrustService';
import { HublaService } from './HublaService';
import { TictoService } from './TictoService';
import { KiwifyService } from './KiwifyService';
import { FRCService } from './FRCService';

export {
  ShopifyService,
  SystemeService,
  StrivPayService,
  AppmaxService,
  PepperService,
  LogzzService,
  MaxWebService,
  Digistore24Service,
  FortPayService,
  ClickBankService,
  CartPandaService,
  DoppusService,
  NitroService,
  MundPayService,
  PagTrustService,
  HublaService,
  TictoService,
  KiwifyService,
  FRCService,
};

export function createPaymentService(platform: PaymentPlatform, config: PaymentPlatformConfig) {
  const { apiKey, secretKey = '', sandbox = true } = config;

  switch (platform) {
    case 'shopify':
      return new ShopifyService(apiKey, secretKey, sandbox);
    case 'systeme':
      return new SystemeService(apiKey, secretKey, sandbox);
    case 'strivpay':
      return new StrivPayService(apiKey, secretKey, sandbox);
    case 'appmax':
      return new AppmaxService(apiKey, secretKey, sandbox);
    case 'pepper':
      return new PepperService(apiKey, secretKey, sandbox);
    case 'logzz':
      return new LogzzService(apiKey, secretKey, sandbox);
    case 'maxweb':
      return new MaxWebService(apiKey, secretKey, sandbox);
    case 'digistore24':
      return new Digistore24Service(apiKey, secretKey, sandbox);
    case 'fortpay':
      return new FortPayService(apiKey, secretKey, sandbox);
    case 'clickbank':
      return new ClickBankService(apiKey, secretKey, sandbox);
    case 'cartpanda':
      return new CartPandaService(apiKey, secretKey, sandbox);
    case 'doppus':
      return new DoppusService(apiKey, secretKey, sandbox);
    case 'nitro':
      return new NitroService(apiKey, secretKey, sandbox);
    case 'mundpay':
      return new MundPayService(apiKey, secretKey, sandbox);
    case 'pagtrust':
      return new PagTrustService(apiKey, secretKey, sandbox);
    case 'hubla':
      return new HublaService(apiKey, secretKey, sandbox);
    case 'ticto':
      return new TictoService(apiKey, secretKey, sandbox);
    case 'kiwify':
      return new KiwifyService(apiKey, secretKey, sandbox);
    case 'frc':
      return new FRCService(apiKey, secretKey, sandbox);
    default:
      throw new Error(`Plataforma de pagamento não suportada: ${platform}`);
  }
} 