import {createHmac} from 'node:crypto';
import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {whatsappAccountsTable, whatsappMessagesTable, whatsappTemplatesTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES} from './helpers/profiles.js';
import whatsappWebhookGet from '@/api/webhooks/whatsapp.get.js';
import whatsappWebhookPost from '@/api/webhooks/whatsapp.post.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/whatsapp-accounts.js',
  'api/__tests__/fixtures/whatsapp-templates.js',
  'api/__tests__/fixtures/whatsapp-messages.js'
];

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const NORTH_PHONE = {display_phone_number: '593991111111', phone_number_id: '8001'};
const TEMPLATE = {message_template_name: 'appointment_reminder', message_template_language: 'es'};

function sign (payload) {
  return `sha256=${createHmac('sha256', 'test-app-secret').update(JSON.stringify(payload)).digest('hex')}`;
}

function notify (changes, {signature, wabaId = '9001'} = {}) {
  const payload = {object: 'whatsapp_business_account', entry: [{id: wabaId, changes}]};

  return buildAuthedEvent({method: 'POST', body: payload, headers: {'x-hub-signature-256': signature || sign(payload)}});
}

function messagesChange (value) {
  return {field: 'messages', value: {messaging_product: 'whatsapp', metadata: NORTH_PHONE, ...value}};
}

async function findMessage (wamid) {
  const [message] = await db.select().from(whatsappMessagesTable).where(eq(whatsappMessagesTable.wamid, wamid));

  return message;
}

beforeEach(async () => {
  await resetAndLoad(FIXTURES);
});

describe('GET /api/webhooks/whatsapp', () => {
  it('responde el challenge con el verify token correcto', async () => {
    const result = await whatsappWebhookGet(buildAuthedEvent({url: '/?hub.mode=subscribe&hub.verify_token=test-verify-token&hub.challenge=12345'}));

    expect(result).toBe('12345');
  });

  it('rechaza un verify token incorrecto', async () => {
    const event = buildAuthedEvent({url: '/?hub.mode=subscribe&hub.verify_token=otro&hub.challenge=12345'});

    await expect(whatsappWebhookGet(event)).rejects.toMatchObject({status: 403});
  });
});

describe('POST /api/webhooks/whatsapp', () => {
  it('rechaza una firma inválida sin tocar la base', async () => {
    const event = notify([messagesChange({statuses: [{id: 'wamid.sent', status: 'delivered', timestamp: '1760000000'}]})], {signature: 'sha256=00'});

    await expect(whatsappWebhookPost(event)).rejects.toMatchObject({status: 401});
    expect((await findMessage('wamid.sent')).status).toBe('sent');
  });

  it('avanza el estado del mensaje y registra la facturación', async () => {
    await whatsappWebhookPost(notify([messagesChange({statuses: [{id: 'wamid.sent', status: 'delivered', timestamp: '1760000000', pricing: {billable: true}}]})]));

    const delivered = await findMessage('wamid.sent');

    expect(delivered.status).toBe('delivered');
    expect(delivered.billable).toBe(true);
    expect(delivered.deliveredAt).toEqual(new Date(1760000000000));
  });

  it('un estado atrasado no retrocede el mensaje', async () => {
    await whatsappWebhookPost(notify([messagesChange({statuses: [{id: 'wamid.read', status: 'delivered', timestamp: '1760000000'}]})]));

    expect((await findMessage('wamid.read')).status).toBe('read');
  });

  it('registra el error de un envío fallido', async () => {
    await whatsappWebhookPost(notify([messagesChange({statuses: [{id: 'wamid.sent', status: 'failed', timestamp: '1760000000', errors: [{code: 131026, title: 'Undeliverable'}]}]})]));

    expect(await findMessage('wamid.sent')).toMatchObject({status: 'failed', errorCode: 131026, errorMessage: 'Undeliverable'});
  });

  it('ignora estados de mensajes de otra clínica', async () => {
    await whatsappWebhookPost(notify([messagesChange({statuses: [{id: 'wamid.south', status: 'read', timestamp: '1760000000'}]})]));

    expect((await findMessage('wamid.south')).status).toBe('sent');
  });

  it('cuenta los mensajes entrantes sin guardar su contenido y sin duplicar reintentos', async () => {
    const incoming = {messages: [{id: 'wamid.nuevo', from: '593991119999', timestamp: '1760000300', type: 'text', text: {body: 'Hola, ¿atienden hoy?'}}]};

    await whatsappWebhookPost(notify([messagesChange(incoming)]));
    await whatsappWebhookPost(notify([messagesChange(incoming)]));

    const rows = await db.select().from(whatsappMessagesTable).where(eq(whatsappMessagesTable.wamid, 'wamid.nuevo'));

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({organization: NORTH, direction: 'inbound', phone: '+593991119999', template: null});
    expect(JSON.stringify(rows[0])).not.toContain('atienden');
  });

  it('un número desconocido no genera filas', async () => {
    const payload = {entry: [{id: '1', changes: [{field: 'messages', value: {metadata: {phone_number_id: '0000'}, messages: [{id: 'wamid.x', from: '1', timestamp: '1760000300'}]}}]}]};

    await whatsappWebhookPost(buildAuthedEvent({method: 'POST', body: payload, headers: {'x-hub-signature-256': sign(payload)}}));

    expect(await findMessage('wamid.x')).toBeUndefined();
  });

  it('cuenta como enviados los mensajes escritos desde la app de WhatsApp Business', async () => {
    await whatsappWebhookPost(notify([{field: 'smb_message_echoes', value: {metadata: NORTH_PHONE, message_echoes: [{id: 'wamid.echo', to: '593991118888', timestamp: '1760000400'}]}}]));

    expect(await findMessage('wamid.echo')).toMatchObject({organization: NORTH, direction: 'outbound', status: 'sent', template: null});
  });

  it('actualiza el estado y la categoría de las plantillas de esa WABA', async () => {
    await whatsappWebhookPost(notify([
      {field: 'message_template_status_update', value: {...TEMPLATE, event: 'REJECTED', reason: 'INVALID_FORMAT'}},
      {field: 'template_category_update', value: {message_template_name: 'appointment_reminder', message_template_language: 'es', previous_category: 'UTILITY', new_category: 'MARKETING'}}
    ]));

    const [template] = await db.select().from(whatsappTemplatesTable).where(eq(whatsappTemplatesTable.id, 'bb2e8400-e29b-41d4-a716-446655440001'));
    const [other] = await db.select().from(whatsappTemplatesTable).where(eq(whatsappTemplatesTable.id, 'bb2e8400-e29b-41d4-a716-446655440003'));

    expect(template).toMatchObject({status: 'rejected', rejectedReason: 'INVALID_FORMAT', category: 'marketing'});
    expect(other).toMatchObject({status: 'approved', category: 'utility'});
  });

  it('marca la cuenta para reconectar cuando el cliente retira la app', async () => {
    await whatsappWebhookPost(notify([{field: 'account_update', value: {event: 'PARTNER_REMOVED'}}]));

    const [account] = await db.select().from(whatsappAccountsTable).where(eq(whatsappAccountsTable.wabaId, '9001'));
    const [other] = await db.select().from(whatsappAccountsTable).where(eq(whatsappAccountsTable.wabaId, '9002'));

    expect(account.status).toBe('reauth_required');
    expect(other.status).toBe('active');
  });
});
