import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'user'])
});

export const profileSchema = userSchema.extend({
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const dashboardSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  layout: z.array(z.any()).default([]),
  is_default: z.boolean().default(false),
  created_by: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const integrationSettingSchema = z.object({
  id: z.string().uuid(),
  platform: z.string().min(1),
  settings: z.record(z.any()).default({}),
  created_by: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export const utmSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  baseUrl: z.string().url(),
  source: z.string().min(1),
  medium: z.string().min(1),
  campaign: z.string().min(1),
  term: z.string().optional(),
  content: z.string().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
});

export type User = z.infer<typeof userSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;
export type IntegrationSetting = z.infer<typeof integrationSettingSchema>;
export type UTM = z.infer<typeof utmSchema>;