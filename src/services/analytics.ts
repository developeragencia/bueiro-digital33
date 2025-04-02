import { supabase } from '../config/supabase';
import type { Analytics } from '../config/supabase';

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
}; 