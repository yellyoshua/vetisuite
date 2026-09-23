import zod from 'zod';
import {listParams} from '@/utils/request-params.js';
import {productCategory} from '@vetisuite/database/schemas/schemas.js';

const emptyToUndefined = (value) => (value === '' ? undefined : value);

const categoryField = zod.preprocess(emptyToUndefined, zod.enum(productCategory.enumValues).optional());
const statusField = zod.preprocess(emptyToUndefined, zod.string().trim().optional());

export const listInventorySchema = listParams.extend({
  category: categoryField,
  status: statusField
});

export const countInventorySchema = zod.object({
  search: zod.string().trim().max(100).optional().catch(undefined),
  category: categoryField,
  status: statusField
});
