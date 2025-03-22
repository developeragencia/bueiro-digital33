import { db } from '../../config/firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { PaymentPlatformConfig, PaymentPlatformStats, Transaction } from '../../types/payment';

export class PaymentPlatformService {
  protected collection = 'payment_platforms';
  protected transactionsCollection = 'transactions';

  async saveConfig(config: PaymentPlatformConfig): Promise<void> {
    try {
      const docRef = doc(db, this.collection, config.id);
      await setDoc(docRef, {
        ...config,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      throw error;
    }
  }

  async getConfig(platformId: string): Promise<PaymentPlatformConfig | null> {
    try {
      const docRef = doc(db, this.collection, platformId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      return docSnap.data() as PaymentPlatformConfig;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      throw error;
    }
  }

  async getAllConfigs(): Promise<PaymentPlatformConfig[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collection));
      return querySnapshot.docs.map(doc => doc.data() as PaymentPlatformConfig);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw error;
    }
  }

  async updateConfig(id: string, updates: Partial<PaymentPlatformConfig>): Promise<void> {
    try {
      const docRef = doc(db, this.collection, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  }

  async saveTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const docRef = await setDoc(doc(collection(db, this.transactionsCollection)), {
        ...transaction,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      throw error;
    }
  }

  async getTransactions(platformId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, this.transactionsCollection),
        where('platformId', '==', platformId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  }

  async getStats(platformId: string): Promise<PaymentPlatformStats> {
    try {
      const transactions = await this.getTransactions(platformId);
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const refundedTransactions = transactions.filter(t => t.status === 'refunded');
      const chargebackTransactions = transactions.filter(t => t.status === 'chargeback');

      const totalSales = completedTransactions.length;
      const totalRevenue = completedTransactions.reduce((acc, curr) => acc + curr.amount, 0);
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
      const refundRate = totalSales > 0 ? (refundedTransactions.length / totalSales) * 100 : 0;
      const chargebackRate = totalSales > 0 ? (chargebackTransactions.length / totalSales) * 100 : 0;

      return {
        totalSales,
        totalRevenue,
        conversionRate: 0, // Implementar lógica específica
        averageOrderValue,
        refundRate,
        chargebackRate,
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw error;
    }
  }
} 