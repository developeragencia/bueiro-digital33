import { supabase } from './supabase';
import { Database } from '../types/supabase';

type Analytics = Database['public']['Tables']['analytics']['Row'];
type AnalyticsInsert = Database['public']['Tables']['analytics']['Insert'];

export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  averageTimeOnSite: number;
  bounceRate: number;
  conversionRate: number;
  revenue: number;
  topSources: { source: string; visits: number }[];
  topMediums: { medium: string; visits: number }[];
  visitsByDate: { date: string; visits: number }[];
}

export class AnalyticsService {
  static async getAnalytics(
    campaignId: string,
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsData> {
    let query = supabase
      .from('analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return {
        totalVisits: 0,
        uniqueVisitors: 0,
        averageTimeOnSite: 0,
        bounceRate: 0,
        conversionRate: 0,
        revenue: 0,
        topSources: [],
        topMediums: [],
        visitsByDate: [],
      };
    }

    // Calcular métricas
    const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);
    const uniqueVisitors = data.reduce(
      (sum, item) => sum + item.unique_visitors,
      0
    );
    const averageTimeOnSite =
      data.reduce((sum, item) => sum + item.average_time, 0) / data.length;
    const bounceRate =
      data.reduce((sum, item) => sum + item.bounce_rate, 0) / data.length;
    const conversions = data.reduce((sum, item) => sum + item.conversions, 0);
    const conversionRate = (conversions / totalVisits) * 100;
    const revenue = data.reduce(
      (sum, item) => sum + (item.revenue || 0),
      0
    );

    // Agrupar por fonte
    const sourceMap = new Map<string, number>();
    data.forEach((item) => {
      if (item.source) {
        const current = sourceMap.get(item.source) || 0;
        sourceMap.set(item.source, current + item.visits);
      }
    });

    // Agrupar por meio
    const mediumMap = new Map<string, number>();
    data.forEach((item) => {
      if (item.medium) {
        const current = mediumMap.get(item.medium) || 0;
        mediumMap.set(item.medium, current + item.visits);
      }
    });

    // Agrupar por data
    const dateMap = new Map<string, number>();
    data.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      const current = dateMap.get(date) || 0;
      dateMap.set(date, current + item.visits);
    });

    return {
      totalVisits,
      uniqueVisitors,
      averageTimeOnSite,
      bounceRate,
      conversionRate,
      revenue,
      topSources: Array.from(sourceMap.entries())
        .map(([source, visits]) => ({ source, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5),
      topMediums: Array.from(mediumMap.entries())
        .map(([medium, visits]) => ({ medium, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5),
      visitsByDate: Array.from(dateMap.entries())
        .map(([date, visits]) => ({ date, visits }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  static async trackVisit(analytics: AnalyticsInsert): Promise<Analytics> {
    const { data, error } = await supabase
      .from('analytics')
      .insert([analytics])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
} 