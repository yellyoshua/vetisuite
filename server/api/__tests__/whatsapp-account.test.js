import {beforeEach, describe, expect, it, vi} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {whatsappAccountsTable, whatsappTemplatesTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/whatsapp-account/whatsapp-account.permissions.js';
import '@/permissions/whatsapp-connection/whatsapp-connection.permissions.js';
import '@/permissions/whatsapp-templates/whatsapp-templates.permissions.js';
import whatsappAccountGet from '@/api/whatsapp-account.get.js';
import whatsappConnectionPost from '@/api/whatsapp-connection.post.js';
import whatsappConnectionDelete from '@/api/whatsapp-connection.delete.js';
import whatsappTemplatesGet from '@/api/whatsapp-templates.get.js';
import whatsappTemplatesPost from '@/api/whatsapp-templates.post.js';

const whatsapp = vi.hoisted(() => ({
  connectAccount: vi.fn(),
  disconnectAccount: vi.fn(),
  syncUtilityTemplates: vi.fn(),
  describeError: vi.fn(() => ({}))
}));

vi.mock('@vetisuite/whatsapp/whatsapp.js', () => whatsapp);

const FIXTURES = [...ACCOUNT_FIXTURES, 'api/__tests__/fixtures/whatsapp-accounts.js', 'api/__tests__/fixtures/whatsapp-templates.js'];

const CONNECT_BODY = {code: 'code-1', wabaId: '9100', phoneNumberId: '8100', consentAccepted: true};

const SYNCED = [
  {metaId: 'tpl-9', name: 'appointment_reminder', language: 'es', status: 'pending', category: 'utility', rejectedReason: null},
  {metaId: 'tpl-10', name: 'vaccine_due_reminder', language: 'es', status: 'pending', category: 'utility', rejectedReason: null}
];

function connect (profile, body = CONNECT_BODY) {
  return buildAuthedEvent({method: 'POST', body, profile});
}

beforeEach(async () => {
  await resetAndLoad(FIXTURES);
  vi.clearAllMocks();
  whatsapp.connectAccount.mockImplementation(async ({phoneNumberId}) => ({phoneNumberId: phoneNumberId || '8100', encryptedAccessToken: 'v1.nuevo.token.cifrado', displayPhoneNumber: '+593 99 000 0000', verifiedName: 'Clínica Nueva'}));
  whatsapp.syncUtilityTemplates.mockResolvedValue(SYNCED);
  whatsapp.disconnectAccount.mockResolvedValue(undefined);
});

describe('GET /api/whatsapp-account', () => {
  it('devuelve solo la cuenta de la organización, sin el token', async () => {
    const {response, errors} = await whatsappAccountGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response).toHaveLength(1);
    expect(response[0].displayPhoneNumber).toBe('+593 99 111 1111');
    expect(response[0].accessToken).toBeUndefined();
    expect(response[0].organization).toBeUndefined();
  });

  it('otra clínica ve la suya y el superadmin no tiene el módulo', async () => {
    const {response} = await whatsappAccountGet(buildAuthedEvent({profile: OTHER_OWNER}));
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await whatsappAccountGet(event);

    expect(response[0].verifiedName).toBe('Clínica Sur');
    expect(event.node.res.statusCode).toBe(400);
  });
});

describe('POST /api/whatsapp-connection', () => {
  beforeEach(async () => {
    await db.delete(whatsappAccountsTable).where(eq(whatsappAccountsTable.organization, '552e8400-e29b-41d4-a716-446655440001'));
    await db.delete(whatsappTemplatesTable).where(eq(whatsappTemplatesTable.organization, '552e8400-e29b-41d4-a716-446655440001'));
  });

  it('conecta el número, guarda el token cifrado y crea las plantillas', async () => {
    const {response, errors} = await whatsappConnectionPost(connect(OWNER));

    expect(errors).toBeNull();
    expect(response.account.displayPhoneNumber).toBe('+593 99 000 0000');
    expect(response.account.accessToken).toBeUndefined();
    expect(response.templates).toHaveLength(2);
    expect(whatsapp.connectAccount).toHaveBeenCalledWith({code: 'code-1', wabaId: '9100', phoneNumberId: '8100'});

    const [stored] = await db.select().from(whatsappAccountsTable).where(eq(whatsappAccountsTable.phoneNumberId, '8100'));

    expect(stored.accessToken).toBe('v1.nuevo.token.cifrado');
    expect(stored.organization).toBe('552e8400-e29b-41d4-a716-446655440001');
    expect(stored.consentAcceptedAt).toBeInstanceOf(Date);
  });

  it('la conexión sobrevive si falla la creación de plantillas', async () => {
    whatsapp.syncUtilityTemplates.mockRejectedValue(new Error('meta caído'));

    const {response, errors} = await whatsappConnectionPost(connect(EMPLOYEE));

    expect(errors).toBeNull();
    expect(response.templates).toEqual([]);
  });

  it('exige aceptar las condiciones', async () => {
    const event = connect(OWNER, {...CONNECT_BODY, consentAccepted: false});

    await whatsappConnectionPost(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(whatsapp.connectAccount).not.toHaveBeenCalled();
  });

  it('rechaza un número ya conectado en otra clínica', async () => {
    const event = connect(OWNER, {...CONNECT_BODY, phoneNumberId: '8002'});

    await whatsappConnectionPost(event);

    expect(event.node.res.statusCode).toBe(409);
    expect(await db.select().from(whatsappAccountsTable).where(eq(whatsappAccountsTable.wabaId, '9100'))).toHaveLength(0);
  });

  it('acepta que el evento no traiga el número y usa el que resuelve el paquete', async () => {
    const {phoneNumberId: _omitted, ...withoutPhone} = CONNECT_BODY;

    const {errors} = await whatsappConnectionPost(connect(OWNER, withoutPhone));

    expect(errors).toBeNull();
    expect(whatsapp.connectAccount).toHaveBeenCalledWith({code: 'code-1', wabaId: '9100', phoneNumberId: undefined});
    expect(await db.select().from(whatsappAccountsTable).where(eq(whatsappAccountsTable.phoneNumberId, '8100'))).toHaveLength(1);
  });

  it('rechaza conectar un segundo número en la misma clínica', async () => {
    await whatsappConnectionPost(connect(OWNER));

    const event = connect(OWNER, {...CONNECT_BODY, phoneNumberId: '8101'});

    await whatsappConnectionPost(event);

    expect(event.node.res.statusCode).toBe(409);
    expect(whatsapp.connectAccount).toHaveBeenCalledTimes(1);
  });

  it('un fallo de Meta responde 502 y no guarda nada', async () => {
    whatsapp.connectAccount.mockRejectedValue(new Error('invalid code'));

    const event = connect(OWNER);

    await whatsappConnectionPost(event);

    expect(event.node.res.statusCode).toBe(502);
    expect(await db.select().from(whatsappAccountsTable).where(eq(whatsappAccountsTable.phoneNumberId, '8100'))).toHaveLength(0);
  });

  it('la organización no se acepta desde el body', async () => {
    const event = connect(OWNER, {...CONNECT_BODY, organization: '552e8400-e29b-41d4-a716-446655440002'});

    await whatsappConnectionPost(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});

describe('DELETE /api/whatsapp-connection', () => {
  it('desconecta el número y borra su cuenta y plantillas', async () => {
    const {response, errors} = await whatsappConnectionDelete(buildAuthedEvent({method: 'DELETE', profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toEqual({disconnected: true});
    expect(whatsapp.disconnectAccount).toHaveBeenCalledWith({wabaId: '9001', encryptedAccessToken: 'v1.cifrado.norte.token'});
    expect(await db.select().from(whatsappAccountsTable).where(eq(whatsappAccountsTable.organization, '552e8400-e29b-41d4-a716-446655440001'))).toHaveLength(0);
    expect(await db.select().from(whatsappAccountsTable)).toHaveLength(1);
    expect(await db.select().from(whatsappTemplatesTable)).toHaveLength(1);
  });

  it('desconecta aunque Meta no responda', async () => {
    whatsapp.disconnectAccount.mockRejectedValue(new Error('timeout'));

    const {errors} = await whatsappConnectionDelete(buildAuthedEvent({method: 'DELETE', profile: EMPLOYEE}));

    expect(errors).toBeNull();
  });
});

describe('/api/whatsapp-templates', () => {
  it('lista solo las plantillas de la organización', async () => {
    const {response} = await whatsappTemplatesGet(buildAuthedEvent({profile: OWNER}));

    expect(response.map((template) => template.name)).toEqual(['appointment_reminder', 'vaccine_due_reminder']);
    expect(response[1].category).toBe('marketing');
    expect(response[0].organization).toBeUndefined();
  });

  it('sincroniza creando las plantillas utility que faltan y respetando la categoría de Meta', async () => {
    whatsapp.syncUtilityTemplates.mockResolvedValue([
      {metaId: 'tpl-1', name: 'appointment_reminder', language: 'es', status: 'approved', category: 'utility', rejectedReason: null},
      {metaId: 'tpl-2', name: 'vaccine_due_reminder', language: 'es', status: 'rejected', category: 'marketing', rejectedReason: 'PROMOTIONAL'}
    ]);

    const {response, errors} = await whatsappTemplatesPost(buildAuthedEvent({method: 'POST', body: {}, profile: OWNER}));

    expect(errors).toBeNull();
    expect(response.templates.find((template) => template.name === 'vaccine_due_reminder')).toMatchObject({status: 'rejected', rejectedReason: 'PROMOTIONAL', category: 'marketing'});
    expect(whatsapp.syncUtilityTemplates.mock.calls[0][0].templates.map((template) => template.name)).toEqual(['appointment_reminder', 'vaccine_due_reminder']);
    expect(await db.select().from(whatsappTemplatesTable).where(eq(whatsappTemplatesTable.organization, '552e8400-e29b-41d4-a716-446655440001'))).toHaveLength(2);
  });

  it('sincronizar sin cuenta conectada responde 409', async () => {
    await db.delete(whatsappAccountsTable);

    const event = buildAuthedEvent({method: 'POST', body: {}, profile: OWNER});

    await whatsappTemplatesPost(event);

    expect(event.node.res.statusCode).toBe(409);
  });
});
