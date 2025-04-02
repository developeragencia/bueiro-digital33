import { supabase } from '../lib/supabase';

export interface AnalyticsData {
  clicks: number;
  conversions: number;
  revenue: number;
  date: string;
}

export interface AnalyticsSummary extends AnalyticsData {
  conversionRate: number;
  averageOrderValue: number;
}

export interface AnalyticsTotals {
  clicks: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  averageOrderValue: number;
  dailyStats: AnalyticsData[];
}

class AnalyticsServiceClass {
  private table = 'analytics';

  async getByDateRange(startDate: string, endDate: string): Promise<AnalyticsData[]> {
    try {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  async getSummary(startDate: string, endDate: string): Promise<AnalyticsSummary> {
    const data = await this.getByDateRange(startDate, endDate);

    const totals = data.reduce((acc: AnalyticsData, curr: AnalyticsData) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
      date: curr.date
    }), { clicks: 0, conversions: 0, revenue: 0, date: '' });

    const conversionRate = totals.clicks > 0
      ? (totals.conversions / totals.clicks) * 100
      : 0;

    const averageOrderValue = totals.conversions > 0
      ? totals.revenue / totals.conversions
      : 0;

    return {
      ...totals,
      conversionRate,
      averageOrderValue
    };
  }

  async getDailyStats(startDate: string, endDate: string): Promise<AnalyticsData[]> {
    const data = await this.getByDateRange(startDate, endDate);
    return data.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async trackClick(campaignId: string) {
    const { error } = await supabase
      .from(this.table)
      .insert({
        campaign_id: campaignId,
        clicks: 1,
        conversions: 0,
        revenue: 0,
        date: new Date().toISOString().split('T')[0]
      });

    if (error) throw error;
  }

  async trackConversion(campaignId: string, revenue: number) {
    const { error } = await supabase
      .from(this.table)
      .insert({
        campaign_id: campaignId,
        clicks: 0,
        conversions: 1,
        revenue,
        date: new Date().toISOString().split('T')[0]
      });

    if (error) throw error;
  }

  async getCampaignStats(campaignId: string, startDate?: string, endDate?: string): Promise<AnalyticsTotals> {
    let query = supabase
      .from(this.table)
      .select('*')
      .eq('campaign_id', campaignId);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const totals = data.reduce((acc: AnalyticsData, curr: AnalyticsData) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
      date: curr.date
    }), { clicks: 0, conversions: 0, revenue: 0, date: '' });

    const conversionRate = totals.clicks > 0
      ? (totals.conversions / totals.clicks) * 100
      : 0;

    const averageOrderValue = totals.conversions > 0
      ? totals.revenue / totals.conversions
      : 0;

    const dailyStats = data.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      ...totals,
      conversionRate,
      averageOrderValue,
      dailyStats
    };
  }

  async getDashboardStats(userId: string, startDate?: string, endDate?: string): Promise<AnalyticsTotals> {
    // Primeiro, obtém todas as campanhas do usuário
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('user_id', userId);

    if (campaignsError) throw campaignsError;

    // Se não houver campanhas, retorna zeros
    if (!campaigns || campaigns.length === 0) {
      return {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        averageOrderValue: 0,
        dailyStats: []
      };
    }

    // Busca analytics para todas as campanhas do usuário
    let query = supabase
      .from(this.table)
      .select('*')
      .in('campaign_id', campaigns.map(c => c.id));

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Calcula totais
    const totals = data.reduce((acc: AnalyticsData, curr: AnalyticsData) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
      date: curr.date
    }), { clicks: 0, conversions: 0, revenue: 0, date: '' });

    const conversionRate = totals.clicks > 0
      ? (totals.conversions / totals.clicks) * 100
      : 0;

    const averageOrderValue = totals.conversions > 0
      ? totals.revenue / totals.conversions
      : 0;

    // Agrupa por data para estatísticas diárias
    const dailyStats = data.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      ...totals,
      conversionRate,
      averageOrderValue,
      dailyStats
    };
  }
}

export const analyticsService = new AnalyticsServiceClass(); 