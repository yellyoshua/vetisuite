import {timingSafeEqual} from 'node:crypto';
import {defineEventHandler, getQuery} from 'h3';

// Handshake de suscripción de Meta: devuelve el challenge solo si el verify token coincide.
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const expected = Buffer.from(process.env.WHATSAPP_VERIFY_TOKEN);
  const received = Buffer.from(String(query['hub.verify_token'] || ''));
  const isValid = query['hub.mode'] === 'subscribe' && received.length === expected.length && timingSafeEqual(received, expected);

  if (!isValid) {
    throw {error: 'Verificación de webhook inválida', status: 403};
  }

  return String(query['hub.challenge']);
});
