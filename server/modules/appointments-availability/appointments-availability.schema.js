import zod from 'zod';
import {listParams} from '@/utils/request-params.js';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeRangeSchema = zod.object({
  start: zod.string().regex(timePattern, 'Formato de hora inválido (HH:mm)'),
  end: zod.string().regex(timePattern, 'Formato de hora inválido (HH:mm)')
});

const dayAvailabilitySchema = zod.object({
  weekday: zod.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
  enabled: zod.boolean(),
  ranges: zod.array(timeRangeSchema)
});

const dateOverrideSchema = zod.object({
  id: zod.string().optional(),
  date: zod.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  label: zod.string().trim().min(1, 'El motivo es obligatorio'),
  ranges: zod.array(timeRangeSchema)
});

export const listAppointmentsAvailabilitySchema = listParams;

export const updateAppointmentsAvailabilitySchema = zod.object({
  id: zod.uuid().optional(),
  timezone: zod.string().trim().min(1, 'La zona horaria es obligatoria'),
  week: zod.array(dayAvailabilitySchema),
  overrides: zod.array(dateOverrideSchema).default([]),
  slotMinutes: zod.number().int().positive('La duración debe ser mayor a 0'),
  bufferBefore: zod.number().int().nonnegative('El margen antes no puede ser negativo').default(0),
  bufferAfter: zod.number().int().nonnegative('El margen después no puede ser negativo').default(0),
  minNoticeHours: zod.number().int().nonnegative('La anticipación mínima no puede ser negativa').default(0),
  maxAdvanceDays: zod.number().int().positive('El límite de reserva debe ser mayor a 0'),
  maxPerDay: zod.number().int().nonnegative('El máximo por día no puede ser negativo').default(0),
  onlineBooking: zod.boolean(),
  autoConfirm: zod.boolean()
});
