import zod from 'zod';
import {listParams} from '@/utils/request-params.js';
import {portalPurpose, portalStatus} from '@vetisuite/database/schemas/schemas.js';

export const listPortalsSchema = listParams.extend({
  purpose: zod.enum(portalPurpose.enumValues).optional(),
  status: zod.enum(portalStatus.enumValues).optional(),
  preset: zod.enum(['published', 'drafts']).optional()
});

export const countPortalsSchema = zod.object({
  id: zod.uuid().optional(),
  search: zod.string().trim().max(100).optional().catch(undefined),
  purpose: zod.enum(portalPurpose.enumValues).optional().catch(undefined),
  status: zod.enum(portalStatus.enumValues).optional().catch(undefined),
  preset: zod.enum(['published', 'drafts']).optional().catch(undefined)
});
