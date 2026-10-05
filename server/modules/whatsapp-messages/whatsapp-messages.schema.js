import zod from 'zod';
import {whatsappMessageDirections, whatsappMessageStatuses} from '@/constants/whatsapp-messages.js';
import {whatsappTemplateMap, whatsappTemplateNames} from '@/constants/whatsapp-templates.js';
import {listParams} from '@/utils/request-params.js';

const PARAMETER_PATTERN = /^(?!.*\s{4})[^\n\r\t]{1,100}$/;

export const listWhatsappMessagesSchema = listParams.extend({
  direction: zod.enum(whatsappMessageDirections).optional(),
  status: zod.enum(whatsappMessageStatuses).optional()
});

export const sendWhatsappMessageSchema = zod.object({
  client: zod.uuid(),
  template: zod.enum(whatsappTemplateNames),
  variables: zod.record(zod.string(), zod.string().trim().regex(PARAMETER_PATTERN, 'Texto de variable inválido'))
}).superRefine((data, context) => {
  const expected = whatsappTemplateMap[data.template].parameters.filter((parameter) => parameter.source === 'input').map((parameter) => parameter.name);
  const received = Object.keys(data.variables);

  if (expected.length !== received.length || !expected.every((name) => received.includes(name))) {
    context.addIssue({code: 'custom', path: ['variables'], message: `Esta plantilla requiere: ${expected.join(', ')}`});
  }
});
