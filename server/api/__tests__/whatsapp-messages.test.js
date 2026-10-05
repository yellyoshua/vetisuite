import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {whatsappAccountsTable, whatsappMessagesTable} from '@vetisuite/database/schemas/schemas.js';
import events from '@/utils/events.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/whatsapp-messages/whatsapp-messages.permissions.js';
import whatsappMessagesGet from '@/api/whatsapp-messages.get.js';
import whatsappMessagesPost from '@/api/whatsapp-messages.post.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/whatsapp-accounts.js',
  'api/__tests__/fixtures/whatsapp-templates.js',
  'api/__tests__/fixtures/whatsapp-messages.js'
];

const OWN_CLIENT = '992e8400-e29b-41d4-a716-446655440001';
const FOREIGN_CLIENT = '992e8400-e29b-41d4-a716-446655440003';
const ARCHIVED_CLIENT = '992e8400-e29b-41d4-a716-446655440004';
const NORTH = '552e8400-e29b-41d4-a716-446655440001';

const REMINDER = {pet_name: 'Luna', date: '12 de octubre', time: '10:30'};

function send (profile, body) {
  return buildAuthedEvent({method: 'POST', body: {client: OWN_CLIENT, template: 'appointment_reminder', variables: REMINDER, ...body}, profile});
}

async function useClientPhone (phone) {
  const {clientsTable} = await import('@vetisuite/database/schemas/schemas.js');

  await db.update(clientsTable).set({phone}).where(eq(clientsTable.id, OWN_CLIENT));
}

beforeEach(async () => {
  await resetAndLoad(FIXTURES);
  events.whatsappUtilityMessage.publish.mockClear();
  events.whatsappUtilityMessage.publish.mockResolvedValue(true);
  await useClientPhone('+593 99 123 4567');
});

describe('GET /api/whatsapp-messages', () => {
  it('lista los mensajes de la organización más recientes primero', async () => {
    const {response, errors} = await whatsappMessagesGet(buildAuthedEvent({url: '/?limit=100', profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveLength(8);
    expect(response.every((message) => message.organization === undefined)).toBe(true);
  });

  it('filtra por dirección y estado', async () => {
    const inbound = await whatsappMessagesGet(buildAuthedEvent({url: '/?direction=inbound', profile: EMPLOYEE}));
    const failed = await whatsappMessagesGet(buildAuthedEvent({url: '/?status=failed', profile: EMPLOYEE}));

    expect(inbound.response).toHaveLength(2);
    expect(failed.response).toHaveLength(1);
    expect(failed.response[0].errorCode).toBe(131026);
  });

  it('un estado inválido responde 400', async () => {
    const event = buildAuthedEvent({url: '/?status=borrado', profile: OWNER});

    await whatsappMessagesGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});

describe('POST /api/whatsapp-messages', () => {
  it('encola un mensaje utility con las variables del cliente y de la clínica', async () => {
    const {response, errors} = await whatsappMessagesPost(send(EMPLOYEE));

    expect(errors).toBeNull();
    expect(response.message.status).toBe('queued');

    const [stored] = await db.select().from(whatsappMessagesTable).where(eq(whatsappMessagesTable.id, response.message.id));

    expect(stored).toMatchObject({organization: NORTH, client: OWN_CLIENT, direction: 'outbound', status: 'queued', phone: '+593991234567', template: 'appointment_reminder'});
    expect(events.whatsappUtilityMessage.publish).toHaveBeenCalledWith({
      organization: NORTH,
      message: response.message.id,
      to: '+593991234567',
      template: 'appointment_reminder',
      language: 'es',
      parameters: {client_name: 'Carla Méndez', pet_name: 'Luna', clinic_name: 'Clínica Norte', date: '12 de octubre', time: '10:30'}
    }, {requestId: undefined});
  });

  it('un teléfono sin código de país se rechaza sin encolar', async () => {
    await useClientPhone('5551001');

    const event = send(OWNER);

    await whatsappMessagesPost(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(events.whatsappUtilityMessage.publish).not.toHaveBeenCalled();
  });

  it('una plantilla que Meta recategorizó a marketing no se puede enviar', async () => {
    const event = send(OWNER, {template: 'vaccine_due_reminder', variables: {pet_name: 'Luna', vaccine: 'Rabia', date: '30 de octubre'}});

    await whatsappMessagesPost(event);

    expect(event.node.res.statusCode).toBe(409);
    expect(events.whatsappUtilityMessage.publish).not.toHaveBeenCalled();
  });

  it('no existe un envío de cumpleaños: solo plantillas del catálogo utility', async () => {
    const event = send(OWNER, {template: 'pet_birthday', variables: {pet_name: 'Luna'}});

    await whatsappMessagesPost(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('exige exactamente las variables de la plantilla', async () => {
    const missing = send(OWNER, {variables: {pet_name: 'Luna'}});
    const extra = send(OWNER, {variables: {...REMINDER, clinic_name: 'Otra clínica'}});

    await whatsappMessagesPost(missing);
    await whatsappMessagesPost(extra);

    expect(missing.node.res.statusCode).toBe(400);
    expect(extra.node.res.statusCode).toBe(400);
  });

  it('rechaza saltos de línea en las variables (Meta los rechaza)', async () => {
    const event = send(OWNER, {variables: {...REMINDER, pet_name: 'Luna\nOferta'}});

    await whatsappMessagesPost(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un cliente de otra clínica o archivado responde 404', async () => {
    const foreign = send(OWNER, {client: FOREIGN_CLIENT});
    const archived = send(OWNER, {client: ARCHIVED_CLIENT});

    await whatsappMessagesPost(foreign);
    await whatsappMessagesPost(archived);

    expect(foreign.node.res.statusCode).toBe(404);
    expect(archived.node.res.statusCode).toBe(404);
  });

  it('sin número conectado o con la conexión vencida responde 409', async () => {
    await db.update(whatsappAccountsTable).set({status: 'reauth_required'}).where(eq(whatsappAccountsTable.organization, NORTH));

    const expired = send(OWNER);

    await whatsappMessagesPost(expired);
    await db.delete(whatsappAccountsTable);

    const disconnected = send(OWNER);

    await whatsappMessagesPost(disconnected);

    expect(expired.node.res.statusCode).toBe(409);
    expect(disconnected.node.res.statusCode).toBe(409);
  });

  it('si la cola no recibe el mensaje lo marca fallido y responde 503', async () => {
    events.whatsappUtilityMessage.publish.mockResolvedValue(false);

    const event = send(OWNER);

    await whatsappMessagesPost(event);

    const failed = await db.select().from(whatsappMessagesTable).where(eq(whatsappMessagesTable.errorMessage, 'queue_unavailable'));

    expect(event.node.res.statusCode).toBe(503);
    expect(failed).toHaveLength(1);
    expect(failed[0].status).toBe('failed');
  });

  it('el superadmin no tiene el módulo', async () => {
    const event = send(SUPERADMIN);

    await whatsappMessagesPost(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
