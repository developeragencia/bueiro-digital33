import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
});

export const profileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido')
});

export const utmSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  baseUrl: z.string().url('URL inválida'),
  source: z.string().min(1, 'Source é obrigatório'),
  medium: z.string().min(1, 'Medium é obrigatório'),
  campaign: z.string().min(1, 'Campaign é obrigatório'),
  term: z.string().optional(),
  content: z.string().optional()
});

export const integrationSchema = z.object({
  platform: z.string().min(1, 'Plataforma é obrigatória'),
  settings: z.record(z.any())
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type UTMFormData = z.infer<typeof utmSchema>;
export type IntegrationFormData = z.infer<typeof integrationSchema>;