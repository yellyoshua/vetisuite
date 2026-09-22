import zod from 'zod';

export const listParams = zod.object({
  id: zod.uuid().optional(),
  page: zod.coerce.number().int().min(1).default(1).catch(1),
  limit: zod.coerce.number().int().min(1).max(100).default(10).catch(10),
  search: zod.string().trim().max(100).optional().catch(undefined),
  order: zod.enum(['asc', 'desc']).default('desc').catch('desc')
});
