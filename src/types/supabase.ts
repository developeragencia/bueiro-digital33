export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications: boolean
          email_updates: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          notifications?: boolean
          email_updates?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          notifications?: boolean
          email_updates?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          status: 'active' | 'inactive' | 'archived'
          start_date: string | null
          end_date: string | null
          budget: number | null
          target_audience: string | null
          objectives: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          status?: 'active' | 'inactive' | 'archived'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          target_audience?: string | null
          objectives?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          status?: 'active' | 'inactive' | 'archived'
          start_date?: string | null
          end_date?: string | null
          budget?: number | null
          target_audience?: string | null
          objectives?: string | null
          user_id?: string
        }
      }
      utms: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          base_url: string
          campaign_id: string
          source: string
          medium: string
          term: string | null
          content: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          base_url: string
          campaign_id: string
          source: string
          medium: string
          term?: string | null
          content?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          base_url?: string
          campaign_id?: string
          source?: string
          medium?: string
          term?: string | null
          content?: string | null
          user_id?: string
        }
      }
      analytics: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          campaign_id: string
          utm_id: string | null
          visits: number
          unique_visitors: number
          bounce_rate: number
          average_time: number
          conversions: number
          revenue: number | null
          source: string | null
          medium: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          campaign_id: string
          utm_id?: string | null
          visits: number
          unique_visitors: number
          bounce_rate: number
          average_time: number
          conversions: number
          revenue?: number | null
          source?: string | null
          medium?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          campaign_id?: string
          utm_id?: string | null
          visits?: number
          unique_visitors?: number
          bounce_rate?: number
          average_time?: number
          conversions?: number
          revenue?: number | null
          source?: string | null
          medium?: string | null
          user_id?: string
        }
      }
      payment_platforms: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          platform: string
          client_id: string | null
          client_secret: string | null
          webhook_secret: string | null
          webhook_url: string | null
          is_active: boolean
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          platform: string
          client_id?: string | null
          client_secret?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
          is_active?: boolean
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          platform?: string
          client_id?: string | null
          client_secret?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
          is_active?: boolean
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface PaymentPlatform {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  platform_id: string;
  api_key: string;
  secret_key: string;
  user_id: string;
  is_active: boolean;
}

export interface Transaction {
  id: string;
  created_at: string;
  updated_at: string;
  platform_id: string;
  order_id: string;
  customer_id: string;
  product_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  user_id: string;
} 