import { Transaction } from '../../../types/payment';
import { BasePaymentService } from './BasePaymentService';

export class StrivPayService extends BasePaymentService {
  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    super(apiKey, secretKey, sandbox);
  }

  async processPayment(amount: number, currency: string, customer: Transaction['customer']): Promise<Transaction> {
    try {
      // Simula uma chamada à API do StrivPay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'> = {
        platform_id: 'strivpay',
        order_id: `order_${Date.now()}`,
        status: 'completed',
        amount,
        currency,
        payment_method: 'credit_card',
        customer,
        metadata: {},
        user_id: customer.document || ''
      };

      return this.saveTransaction(transaction);
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async processRefund(transactionId: string): Promise<boolean> {
    try {
      // Simula uma chamada à API do StrivPay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Error processing refund:', error);
      return false;
    }
  }

  validateWebhook(payload: any, signature: string): boolean {
    // Implementar validação real do webhook
    return true;
  }
} 