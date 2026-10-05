import zod from 'zod';
import {listParams} from '@/utils/request-params.js';

export const listWhatsappTemplatesSchema = listParams;

export const syncWhatsappTemplatesSchema = zod.object({});
