import zod from 'zod';

const metaId = zod.string().regex(/^\d{1,32}$/, 'Identificador de WhatsApp inválido');

export const getWhatsappAccountSchema = zod.object({});

export const connectWhatsappAccountSchema = zod.object({
  code: zod.string().min(1, 'Falta el código de autorización de Meta').max(2000),
  wabaId: metaId,
  phoneNumberId: metaId.optional(),
  consentAccepted: zod.literal(true, 'Debes aceptar las condiciones de uso de WhatsApp')
});

export const disconnectWhatsappAccountSchema = zod.object({});
