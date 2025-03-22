import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface Campaign {
  id?: string;
  name: string;
  description: string;
  platform: 'facebook' | 'instagram' | 'google';
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate: Date;
  endDate: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const campaignService = {
  create: async (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'campaigns'), {
        ...campaign,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      throw error;
    }
  },

  update: async (id: string, data: Partial<Campaign>) => {
    try {
      const docRef = doc(db, 'campaigns', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const docRef = doc(db, 'campaigns', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erro ao deletar campanha:', error);
      throw error;
    }
  },

  getAll: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'campaigns'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Campaign[];
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
      throw error;
    }
  },

  getActive: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'campaigns'),
        where('userId', '==', userId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Campaign[];
    } catch (error) {
      console.error('Erro ao buscar campanhas ativas:', error);
      throw error;
    }
  },

  getStats: async (userId: string) => {
    try {
      const campaigns = await campaignService.getAll(userId);
      return {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === 'active').length,
        totalBudget: campaigns.reduce((acc, curr) => acc + curr.budget, 0),
        totalSpent: campaigns.reduce((acc, curr) => acc + curr.spent, 0),
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },
}; 