import zod from 'zod';
import {listParams} from '@/utils/request-params.js';

export const listBillingSchema = listParams.extend({
  status: zod.enum(['open', 'receivable', 'paid']).optional(),
  preset: zod.enum(['open-account', 'overdue', 'paid-today']).optional()
});

export const countBillingSchema = zod.object({
  id: zod.uuid().optional(),
  search: zod.string().trim().max(100).optional().catch(undefined),
  status: zod.enum(['open', 'receivable', 'paid']).optional().catch(undefined),
  preset: zod.enum(['open-account', 'overdue', 'paid-today']).optional().catch(undefined)
});
