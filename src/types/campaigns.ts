export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  start_date?: string;
  end_date?: string;
  budget?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  metrics?: {
    clicks: number;
    conversions: number;
    revenue: number;
    cost: number;
  };
} 