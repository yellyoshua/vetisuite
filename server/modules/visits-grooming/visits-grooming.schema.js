import zod from 'zod';
import {listParams} from '@/utils/request-params.js';

export const listVisitsGroomingSchema = listParams.extend({
  status: zod.enum(['pending', 'in-progress', 'finished', 'delivered']).optional(),
  preset: zod.enum(['undelivered', 'delivered']).optional()
});

export const countVisitsGroomingSchema = zod.object({
  search: zod.string().trim().max(100).optional().catch(undefined),
  status: zod.enum(['pending', 'in-progress', 'finished', 'delivered']).optional().catch(undefined),
  preset: zod.enum(['undelivered', 'delivered']).optional().catch(undefined)
});
