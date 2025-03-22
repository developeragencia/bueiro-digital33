import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore';

export interface UTMLink {
  id?: string;
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  userId: string;
  createdAt: Date;
  clicks: number;
}

export const utmService = {
  create: async (utm: Omit<UTMLink, 'id' | 'createdAt' | 'clicks'>) => {
    try {
      const docRef = await addDoc(collection(db, 'utm_links'), {
        ...utm,
        createdAt: Timestamp.now(),
        clicks: 0,
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao criar link UTM:', error);
      throw error;
    }
  },

  getAll: async (userId: string) => {
    try {
      const q = query(
        collection(db, 'utm_links'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UTMLink[];
    } catch (error) {
      console.error('Erro ao buscar links UTM:', error);
      throw error;
    }
  },

  incrementClicks: async (id: string) => {
    try {
      const docRef = doc(db, 'utm_links', id);
      await updateDoc(docRef, {
        clicks: increment(1),
      });
    } catch (error) {
      console.error('Erro ao incrementar clicks:', error);
      throw error;
    }
  },

  getStats: async (userId: string) => {
    try {
      const links = await utmService.getAll(userId);
      return {
        totalLinks: links.length,
        totalClicks: links.reduce((acc, curr) => acc + curr.clicks, 0),
        topSources: Object.entries(
          links.reduce((acc, curr) => {
            if (!acc[curr.source]) {
              acc[curr.source] = 0;
            }
            acc[curr.source] += curr.clicks;
            return acc;
          }, {} as Record<string, number>)
        )
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
        topCampaigns: Object.entries(
          links.reduce((acc, curr) => {
            if (!acc[curr.campaign]) {
              acc[curr.campaign] = 0;
            }
            acc[curr.campaign] += curr.clicks;
            return acc;
          }, {} as Record<string, number>)
        )
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },
}; 