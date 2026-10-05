import {defineEventHandler, getRequestHeader, readRawBody} from 'h3';
import {parseWebhook, verifyWebhookSignature} from '@vetisuite/whatsapp/whatsapp.js';
import {processWhatsappEvents} from '@/modules/whatsapp-webhook/whatsapp-webhook.service.js';

// Lo autentica la firma HMAC del cuerpo crudo, no una sesión. Si procesar falla, el 500 hace que
// Meta reintente; por eso el procesamiento es idempotente y solo hace avanzar estados.
export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, 'utf8');

  if (!verifyWebhookSignature({rawBody: rawBody || '', signature: getRequestHeader(event, 'x-hub-signature-256')})) {
    throw {error: 'Firma de webhook inválida', status: 401};
  }

  await processWhatsappEvents(parseWebhook(JSON.parse(rawBody)));

  return {received: true};
});
