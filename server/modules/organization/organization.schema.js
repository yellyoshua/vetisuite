import zod from 'zod';
import {isSupportedTimeZone} from '@/utils/timezone.js';

export const findOrganizationSchema = zod.object({});

export const updateOrganizationSchema = zod.object({
  timezone: zod.string().refine(isSupportedTimeZone, 'La zona horaria no es válida')
});
