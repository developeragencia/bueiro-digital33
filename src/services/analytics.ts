import { supabase } from '../lib/supabase';
import type { Analytics } from '../config/supabase';

interface AnalyticsData {
  clicks: number;
  conversions: number;
  revenue: number;
  date: string;
}

interface AnalyticsSummary extends AnalyticsData {
  conversionRate: number;
  averageOrderValue: number;
}

interface AnalyticsTotals {
  clicks: number;
  conversions: number;
  revenue: number;
  conversion_rate: number;
  average_order_value: number;
}

class AnalyticsServiceClass {
  private table = 'analytics';

  async getByDateRange(startDate: string, endDate: string): Promise<AnalyticsData[]> {
    const { data, error } = await supabase
      .from(this.table)
      .select()
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data;
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
    const today = new Date().toISOString().split('T')[0];
    
    // Tenta encontrar um registro existente para hoje
    const { data: existingRecord } = await supabase
      .from('analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('date', today)
      .single();

    if (existingRecord) {
      // Atualiza o registro existente
      const { error } = await supabase
        .from('analytics')
        .update({ clicks: existingRecord.clicks + 1 })
        .eq('id', existingRecord.id);

      if (error) throw error;
    } else {
      // Cria um novo registro
      const { error } = await supabase
        .from('analytics')
        .insert([{
          campaign_id: campaignId,
          clicks: 1,
          conversions: 0,
          revenue: 0,
          date: today,
        }]);

      if (error) throw error;
    }
  }

  async trackConversion(campaignId: string, revenue: number) {
    const today = new Date().toISOString().split('T')[0];
    
    // Tenta encontrar um registro existente para hoje
    const { data: existingRecord } = await supabase
      .from('analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('date', today)
      .single();

    if (existingRecord) {
      // Atualiza o registro existente
      const { error } = await supabase
        .from('analytics')
        .update({
          conversions: existingRecord.conversions + 1,
          revenue: existingRecord.revenue + revenue,
        })
        .eq('id', existingRecord.id);

      if (error) throw error;
    } else {
      // Cria um novo registro
      const { error } = await supabase
        .from('analytics')
        .insert([{
          campaign_id: campaignId,
          clicks: 0,
          conversions: 1,
          revenue,
          date: today,
        }]);

      if (error) throw error;
    }
  }

  async getCampaignStats(campaignId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('analytics')
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

    // Calcula as métricas totais
    const totals = data.reduce((acc, curr) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }), { clicks: 0, conversions: 0, revenue: 0 });

    // Calcula a taxa de conversão
    const conversionRate = totals.clicks > 0 
      ? (totals.conversions / totals.clicks) * 100 
      : 0;

    // Calcula o valor médio por conversão
    const averageOrderValue = totals.conversions > 0 
      ? totals.revenue / totals.conversions 
      : 0;

    return {
      ...totals,
      conversionRate,
      averageOrderValue,
      dailyStats: data,
    };
  }

  async getDashboardStats(userId: string, startDate?: string, endDate?: string) {
    // Primeiro, obtém todas as campanhas do usuário
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('user_id', userId);

    if (campaignsError) throw campaignsError;

    const campaignIds = campaigns.map(c => c.id);

    // Obtém as estatísticas para todas as campanhas
    let query = supabase
      .from('analytics')
      .select('*')
      .in('campaign_id', campaignIds);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Agrupa os dados por data
    const dailyStats = data.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = {
          date: curr.date,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        };
      }

      acc[curr.date].clicks += curr.clicks;
      acc[curr.date].conversions += curr.conversions;
      acc[curr.date].revenue += curr.revenue;

      return acc;
    }, {} as Record<string, Analytics>);

    // Calcula as métricas totais
    const totals = Object.values(dailyStats).reduce((acc, curr) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }), { clicks: 0, conversions: 0, revenue: 0 });

    // Calcula a taxa de conversão
    const conversionRate = totals.clicks > 0 
      ? (totals.conversions / totals.clicks) * 100 
      : 0;

    // Calcula o valor médio por conversão
    const averageOrderValue = totals.conversions > 0 
      ? totals.revenue / totals.conversions 
      : 0;

    return {
      ...totals,
      conversionRate,
      averageOrderValue,
      dailyStats: Object.values(dailyStats).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    };
  }

  calculateTotals(data: AnalyticsData[]): AnalyticsTotals {
    const totals = data.reduce((acc, curr) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }), {
      clicks: 0,
      conversions: 0,
      revenue: 0
    });

    const conversionRate = totals.clicks > 0
      ? (totals.conversions / totals.clicks) * 100
      : 0;

    const averageOrderValue = totals.conversions > 0
      ? totals.revenue / totals.conversions
      : 0;

    return {
      ...totals,
      conversion_rate: conversionRate,
      average_order_value: averageOrderValue
    };
  }
}

export const analyticsService = new AnalyticsServiceClass(); 
import { supabase } from '../config/supabase';
import type { Analytics } from '../config/supabase';

interface AnalyticsData {
  clicks: number;
  conversions: number;
  revenue: number;
  date: string;
}

interface AnalyticsTotals {
  clicks: number;
  conversions: number;
  revenue: number;
  conversion_rate: number;
  average_order_value: number;
}

export const analyticsService = {
  async trackClick(campaignId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    // Tenta encontrar um registro existente para hoje
    const { data: existingRecord } = await supabase
      .from('analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('date', today)
      .single();

    if (existingRecord) {
      // Atualiza o registro existente
      const { error } = await supabase
        .from('analytics')
        .update({ clicks: existingRecord.clicks + 1 })
        .eq('id', existingRecord.id);

      if (error) throw error;
    } else {
      // Cria um novo registro
      const { error } = await supabase
        .from('analytics')
        .insert([{
          campaign_id: campaignId,
          clicks: 1,
          conversions: 0,
          revenue: 0,
          date: today,
        }]);

      if (error) throw error;
    }
  },

  async trackConversion(campaignId: string, revenue: number) {
    const today = new Date().toISOString().split('T')[0];
    
    // Tenta encontrar um registro existente para hoje
    const { data: existingRecord } = await supabase
      .from('analytics')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('date', today)
      .single();

    if (existingRecord) {
      // Atualiza o registro existente
      const { error } = await supabase
        .from('analytics')
        .update({
          conversions: existingRecord.conversions + 1,
          revenue: existingRecord.revenue + revenue,
        })
        .eq('id', existingRecord.id);

      if (error) throw error;
    } else {
      // Cria um novo registro
      const { error } = await supabase
        .from('analytics')
        .insert([{
          campaign_id: campaignId,
          clicks: 0,
          conversions: 1,
        revenue,
          date: today,
        }]);

      if (error) throw error;
    }
  },

  async getCampaignStats(campaignId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('analytics')
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

    // Calcula as métricas totais
    const totals = data.reduce((acc, curr) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }), { clicks: 0, conversions: 0, revenue: 0 });

    // Calcula a taxa de conversão
    const conversionRate = totals.clicks > 0 
      ? (totals.conversions / totals.clicks) * 100 
      : 0;

    // Calcula o valor médio por conversão
    const averageOrderValue = totals.conversions > 0 
      ? totals.revenue / totals.conversions 
      : 0;

    return {
      ...totals,
      conversionRate,
      averageOrderValue,
      dailyStats: data,
    };
  },

  async getDashboardStats(userId: string, startDate?: string, endDate?: string) {
    // Primeiro, obtém todas as campanhas do usuário
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('user_id', userId);

    if (campaignsError) throw campaignsError;

    const campaignIds = campaigns.map(c => c.id);

    // Obtém as estatísticas para todas as campanhas
    let query = supabase
      .from('analytics')
      .select('*')
      .in('campaign_id', campaignIds);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Agrupa os dados por data
    const dailyStats = data.reduce((acc, curr) => {
      if (!acc[curr.date]) {
        acc[curr.date] = {
          date: curr.date,
          clicks: 0,
            conversions: 0,
          revenue: 0,
          };
        }

      acc[curr.date].clicks += curr.clicks;
      acc[curr.date].conversions += curr.conversions;
      acc[curr.date].revenue += curr.revenue;

        return acc;
    }, {} as Record<string, Analytics>);

    // Calcula as métricas totais
    const totals = Object.values(dailyStats).reduce((acc, curr) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }), { clicks: 0, conversions: 0, revenue: 0 });

    // Calcula a taxa de conversão
    const conversionRate = totals.clicks > 0 
      ? (totals.conversions / totals.clicks) * 100 
      : 0;

    // Calcula o valor médio por conversão
    const averageOrderValue = totals.conversions > 0 
      ? totals.revenue / totals.conversions 
      : 0;

    return {
      ...totals,
      conversionRate,
      averageOrderValue,
      dailyStats: Object.values(dailyStats).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    };
  },

  calculateTotals(data: AnalyticsData[]): AnalyticsTotals {
    const totals = data.reduce((acc, curr) => ({
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      revenue: acc.revenue + curr.revenue,
    }), {
      clicks: 0,
      conversions: 0,
      revenue: 0
    });

    const conversionRate = totals.clicks > 0
      ? (totals.conversions / totals.clicks) * 100
      : 0;

    const averageOrderValue = totals.conversions > 0
      ? totals.revenue / totals.conversions
      : 0;

    return {
      ...totals,
      conversion_rate: conversionRate,
      average_order_value: averageOrderValue
    };
  }
}; 