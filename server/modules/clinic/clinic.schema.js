import zod from 'zod';
import {listParams} from '@/utils/request-params.js';

export const listClinicSchema = listParams.extend({
  kind: zod.enum(['consultation', 'lab-order', 'prescription']).optional(),
  status: zod.enum(['in-progress', 'requested', 'result']).optional(),
  preset: zod.enum(['pending-result', 'resolved-today']).optional()
});

export const countClinicSchema = zod.object({
  id: zod.uuid().optional(),
  search: zod.string().trim().max(100).optional().catch(undefined),
  kind: zod.enum(['consultation', 'lab-order', 'prescription']).optional().catch(undefined),
  status: zod.enum(['in-progress', 'requested', 'result']).optional().catch(undefined),
  preset: zod.enum(['pending-result', 'resolved-today']).optional().catch(undefined)
});
