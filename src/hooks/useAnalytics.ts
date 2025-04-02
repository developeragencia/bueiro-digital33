import { useState, useEffect } from 'react';
import { AnalyticsService } from '../services/analytics';

interface AnalyticsData {
  id: string;
  created_at: string;
  updated_at: string;
  campaign_id: string;
  utm_id: string | null;
  visits: number;
  unique_visitors: number;
  bounce_rate: number;
  average_time: number;
  conversions: number;
  revenue: number | null;
  source: string | null;
  medium: string | null;
  user_id: string;
  visitor_id?: string;
  time_on_site?: number;
  is_bounce?: boolean;
  is_conversion?: boolean;
}

interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  averageTimeOnSite: number;
  bounceRate: number;
  conversionRate: number;
  topSources: { source: string; count: number }[];
  topMediums: { medium: string; count: number }[];
  visitsByDate: { date: string; visits: number }[];
}

export function useAnalytics(campaignId: string) {
  const [rawData, setRawData] = useState<AnalyticsData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalVisits: 0,
    uniqueVisitors: 0,
    averageTimeOnSite: 0,
    bounceRate: 0,
    conversionRate: 0,
    topSources: [],
    topMediums: [],
    visitsByDate: []
  });

  useEffect(() => {
    const loadData = async () => {
      const result = await AnalyticsService.getByCampaign(campaignId);
      setRawData(result as AnalyticsData[]);

      setSummary({
        totalVisits: result.length,
        uniqueVisitors: new Set(result.map((r: AnalyticsData) => r.visitor_id)).size,
        averageTimeOnSite: calculateAverageTimeOnSite(result as AnalyticsData[]),
        bounceRate: calculateBounceRate(result as AnalyticsData[]),
        conversionRate: calculateConversionRate(result as AnalyticsData[]),
        topSources: calculateTopSources(result as AnalyticsData[]),
        topMediums: calculateTopMediums(result as AnalyticsData[]),
        visitsByDate: calculateVisitsByDate(result as AnalyticsData[])
      });
    };

    loadData();
  }, [campaignId]);

  return { rawData, summary };
}

function calculateAverageTimeOnSite(analytics: AnalyticsData[]): number {
  const times = analytics
    .filter(a => a.time_on_site)
    .map(a => a.time_on_site as number);

  if (times.length === 0) return 0;
  return times.reduce((a, b) => a + b, 0) / times.length;
}

function calculateBounceRate(analytics: AnalyticsData[]): number {
  if (analytics.length === 0) return 0;
  const bounces = analytics.filter(a => a.is_bounce).length;
  return (bounces / analytics.length) * 100;
}

function calculateConversionRate(analytics: AnalyticsData[]): number {
  if (analytics.length === 0) return 0;
  const conversions = analytics.filter(a => a.is_conversion).length;
  return (conversions / analytics.length) * 100;
}

function calculateTopSources(analytics: AnalyticsData[]): { source: string; count: number }[] {
  const sources = analytics.reduce((acc, curr) => {
    if (!curr.source) return acc;
    acc[curr.source] = (acc[curr.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(sources)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calculateTopMediums(analytics: AnalyticsData[]): { medium: string; count: number }[] {
  const mediums = analytics.reduce((acc, curr) => {
    if (!curr.medium) return acc;
    acc[curr.medium] = (acc[curr.medium] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(mediums)
    .map(([medium, count]) => ({ medium, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calculateVisitsByDate(analytics: AnalyticsData[]): { date: string; visits: number }[] {
  const visitsByDate = analytics.reduce((acc, curr) => {
    const date = curr.created_at.split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(visitsByDate)
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
} 