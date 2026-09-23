import zod from 'zod';
import {listParams} from '@/utils/request-params.js';

export const listVisitsSchema = listParams.extend({
  type: zod.enum(['ambulatory', 'grooming', 'laboratory']).optional(),
  status: zod.enum(['pending', 'in-progress', 'done']).optional(),
  staff: zod.string().trim().optional()
});

export const countVisitsSchema = zod.object({
  search: zod.string().trim().max(100).optional().catch(undefined),
  type: zod.enum(['ambulatory', 'grooming', 'laboratory']).optional().catch(undefined),
  status: zod.enum(['pending', 'in-progress', 'done']).optional().catch(undefined),
  staff: zod.string().trim().optional().catch(undefined)
});

export const updateVisitStatusSchema = zod.object({
  id: zod.uuid(),
  status: zod.enum(['in-progress', 'done']).optional()
});
