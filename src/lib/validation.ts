import { z } from 'zod';

// Regex para telefone PT: +351 seguido de 9 dígitos OU 9 dígitos começando com 9
const phoneRegex = /^(\+351)?9\d{8}$/;

// Normalizar telefone para formato +351XXXXXXXXX
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (cleaned.startsWith('+351')) {
    return cleaned;
  }
  if (cleaned.startsWith('351')) {
    return '+' + cleaned;
  }
  return '+351' + cleaned;
}

// Validar telefone PT
export function isValidPTPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return phoneRegex.test(normalized);
}

// Mascarar telefone para listas públicas (ex: 962***040)
export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  const digits = normalized.replace('+351', '');
  if (digits.length !== 9) return '***';
  return digits.substring(0, 3) + '***' + digits.substring(6);
}

// Mascarar nome para listas públicas (ex: João S.)
export function maskName(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0];
  }
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

// Schema de validação para pedido de boleia
export const rideRequestSchema = z.object({
  requester_name: z.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  requester_phone: z.string()
    .trim()
    .refine((val) => isValidPTPhone(val), {
      message: 'Número de telefone inválido. Use formato: 9XXXXXXXX ou +351XXXXXXXXX',
    }),
  pickup_location_text: z.string()
    .trim()
    .min(3, 'Local de partida é obrigatório')
    .max(200, 'Local muito longo'),
  dropoff_location_text: z.string()
    .trim()
    .min(3, 'Destino é obrigatório')
    .max(200, 'Destino muito longo'),
  window_start: z.date({
    required_error: 'Data/hora de início é obrigatória',
  }).refine((date) => date > new Date(), {
    message: 'Data/hora deve ser no futuro',
  }),
  window_end: z.date({
    required_error: 'Data/hora de fim é obrigatória',
  }),
  passengers: z.number()
    .int()
    .min(1, 'Mínimo 1 passageiro')
    .max(20, 'Máximo 20 passageiros'),
  special_needs: z.array(z.string()).optional(),
  notes: z.string().max(500, 'Notas muito longas').optional(),
  honeypot: z.string().max(0, 'Campo inválido').optional(),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: 'Deve aceitar os termos e condições',
  }),
}).refine((data) => data.window_end > data.window_start, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['window_end'],
});

// Schema de validação para oferta de boleia
export const rideOfferSchema = z.object({
  driver_name: z.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo'),
  driver_phone: z.string()
    .trim()
    .refine((val) => isValidPTPhone(val), {
      message: 'Número de telefone inválido. Use formato: 9XXXXXXXX ou +351XXXXXXXXX',
    }),
  vehicle_type: z.string()
    .min(1, 'Tipo de veículo é obrigatório'),
  seats_available: z.number()
    .int()
    .min(1, 'Mínimo 1 lugar')
    .max(50, 'Máximo 50 lugares'),
  departure_area_text: z.string()
    .trim()
    .min(3, 'Zona de partida é obrigatória')
    .max(200, 'Zona muito longa'),
  can_go_distance: z.enum(['LOCAL', 'UP_TO_1H', 'ANY']),
  time_window_start: z.date({
    required_error: 'Data/hora de início é obrigatória',
  }).refine((date) => date > new Date(), {
    message: 'Data/hora deve ser no futuro',
  }),
  time_window_end: z.date({
    required_error: 'Data/hora de fim é obrigatória',
  }),
  equipment: z.array(z.string()).optional(),
  notes: z.string().max(500, 'Notas muito longas').optional(),
  honeypot: z.string().max(0, 'Campo inválido').optional(),
  accept_terms: z.boolean().refine((val) => val === true, {
    message: 'Deve aceitar os termos e condições',
  }),
}).refine((data) => data.time_window_end > data.time_window_start, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['time_window_end'],
});

export type RideRequestFormData = z.infer<typeof rideRequestSchema>;
export type RideOfferFormData = z.infer<typeof rideOfferSchema>;
