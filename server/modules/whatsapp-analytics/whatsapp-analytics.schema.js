import zod from 'zod';

export const ANALYTICS_DAYS = [7, 14, 30];

export const whatsappAnalyticsSchema = zod.object({
  days: zod.coerce.number().refine((days) => ANALYTICS_DAYS.includes(days), 'Rango de días inválido').default(7)
});
