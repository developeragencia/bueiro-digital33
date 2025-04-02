import { Transaction } from '../../../types/payment';
import { supabase } from '../../../lib/supabase';

export abstract class BasePaymentService {
  protected apiKey: string;
  protected secretKey: string;
  protected sandbox: boolean;

  constructor(apiKey: string, secretKey: string, sandbox: boolean = true) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.sandbox = sandbox;
  }

  protected async saveTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  abstract processPayment(amount: number, currency: string, customer: Transaction['customer']): Promise<Transaction>;
  abstract processRefund(transactionId: string): Promise<boolean>;
  abstract validateWebhook(payload: any, signature: string): boolean;
} 