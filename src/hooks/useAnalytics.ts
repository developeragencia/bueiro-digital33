import { useState } from 'react';
import { AnalyticsService } from '../services/AnalyticsService';
import { Database } from '../types/supabase';
import { useLoading } from './useLoading';
import { useNotification } from './useNotification';

type Analytics = Database['public']['Tables']['analytics']['Row'];

export interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  averageTimeOnSite: number;
  bounceRate: number;
  conversionRate: number;
  topSources: Array<{ source: string; count: number }>;
  topMediums: Array<{ medium: string; count: number }>;
  visitsByDate: Array<{ date: string; count: number }>;
}

export function useAnalytics(campaignId: string, userId: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [rawData, setRawData] = useState<Analytics[]>([]);
  const notification = useNotification();

  const [loadAnalytics, isLoading] = useLoading(AnalyticsService.getByCampaign);

  const fetchAnalytics = async (startDate?: Date, endDate?: Date) => {
    try {
      const result = await loadAnalytics(campaignId, userId, startDate, endDate);
      setRawData(result);

      // Processa os dados brutos em métricas úteis
      const processedData: AnalyticsData = {
        totalVisits: result.length,
        uniqueVisitors: new Set(result.map(r => r.visitor_id)).size,
        averageTimeOnSite: calculateAverageTimeOnSite(result),
        bounceRate: calculateBounceRate(result),
        conversionRate: calculateConversionRate(result),
        topSources: calculateTopSources(result),
        topMediums: calculateTopMediums(result),
        visitsByDate: calculateVisitsByDate(result),
      };

      setData(processedData);
      return processedData;
    } catch (error) {
      notification.error('Erro ao carregar dados de analytics');
      throw error;
    }
  };

  const calculateAverageTimeOnSite = (analytics: Analytics[]): number => {
    const times = analytics
      .filter(a => a.time_on_site)
      .map(a => a.time_on_site as number);
    return times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  };

  const calculateBounceRate = (analytics: Analytics[]): number => {
    const bounces = analytics.filter(a => a.is_bounce).length;
    return analytics.length ? (bounces / analytics.length) * 100 : 0;
  };

  const calculateConversionRate = (analytics: Analytics[]): number => {
    const conversions = analytics.filter(a => a.is_conversion).length;
    return analytics.length ? (conversions / analytics.length) * 100 : 0;
  };

  const calculateTopSources = (analytics: Analytics[]): Array<{ source: string; count: number }> => {
    const sources = analytics.reduce((acc, curr) => {
      const source = curr.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sources)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const calculateTopMediums = (analytics: Analytics[]): Array<{ medium: string; count: number }> => {
    const mediums = analytics.reduce((acc, curr) => {
      const medium = curr.medium || 'unknown';
      acc[medium] = (acc[medium] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(mediums)
      .map(([medium, count]) => ({ medium, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const calculateVisitsByDate = (analytics: Analytics[]): Array<{ date: string; count: number }> => {
    const visits = analytics.reduce((acc, curr) => {
      const date = new Date(curr.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(visits)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  return {
    data,
    rawData,
    isLoading,
    fetchAnalytics,
  };
} 