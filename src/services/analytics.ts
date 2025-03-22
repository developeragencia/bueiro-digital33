import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  startOf,
  endOf,
} from 'firebase/firestore';

export interface AnalyticsEvent {
  id?: string;
  type: 'pageview' | 'conversion' | 'click' | 'impression';
  source: string;
  campaign?: string;
  url: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AnalyticsStats {
  pageviews: number;
  conversions: number;
  clicks: number;
  impressions: number;
  conversionRate: number;
  revenue: number;
}

export const analyticsService = {
  trackEvent: async (event: Omit<AnalyticsEvent, 'id' | 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'analytics_events'), {
        ...event,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao registrar evento:', error);
      throw error;
    }
  },

  getStats: async (
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsStats> => {
    try {
      const q = query(
        collection(db, 'analytics_events'),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AnalyticsEvent[];

      const pageviews = events.filter((e) => e.type === 'pageview').length;
      const conversions = events.filter((e) => e.type === 'conversion').length;
      const clicks = events.filter((e) => e.type === 'click').length;
      const impressions = events.filter((e) => e.type === 'impression').length;

      const conversionRate = impressions > 0 ? (conversions / impressions) * 100 : 0;
      const revenue = events
        .filter((e) => e.type === 'conversion')
        .reduce((acc, curr) => acc + (curr.metadata?.value || 0), 0);

      return {
        pageviews,
        conversions,
        clicks,
        impressions,
        conversionRate,
        revenue,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  getEventsBySource: async (
    userId: string,
    startDate: Date,
    endDate: Date
  ) => {
    try {
      const q = query(
        collection(db, 'analytics_events'),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AnalyticsEvent[];

      const sourceStats = events.reduce((acc, event) => {
        if (!acc[event.source]) {
          acc[event.source] = {
            pageviews: 0,
            conversions: 0,
            clicks: 0,
            impressions: 0,
          };
        }

        acc[event.source][event.type] += 1;
        return acc;
      }, {} as Record<string, { pageviews: number; conversions: number; clicks: number; impressions: number }>);

      return Object.entries(sourceStats).map(([source, stats]) => ({
        source,
        ...stats,
        conversionRate:
          stats.impressions > 0
            ? (stats.conversions / stats.impressions) * 100
            : 0,
      }));
    } catch (error) {
      console.error('Erro ao buscar eventos por fonte:', error);
      throw error;
    }
  },

  getEventsByCampaign: async (
    userId: string,
    startDate: Date,
    endDate: Date
  ) => {
    try {
      const q = query(
        collection(db, 'analytics_events'),
        where('userId', '==', userId),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate),
        where('campaign', '!=', null),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AnalyticsEvent[];

      const campaignStats = events.reduce((acc, event) => {
        if (!event.campaign) return acc;

        if (!acc[event.campaign]) {
          acc[event.campaign] = {
            pageviews: 0,
            conversions: 0,
            clicks: 0,
            impressions: 0,
          };
        }

        acc[event.campaign][event.type] += 1;
        return acc;
      }, {} as Record<string, { pageviews: number; conversions: number; clicks: number; impressions: number }>);

      return Object.entries(campaignStats).map(([campaign, stats]) => ({
        campaign,
        ...stats,
        conversionRate:
          stats.impressions > 0
            ? (stats.conversions / stats.impressions) * 100
            : 0,
      }));
    } catch (error) {
      console.error('Erro ao buscar eventos por campanha:', error);
      throw error;
    }
  },
}; 