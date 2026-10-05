import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/whatsapp-analytics/whatsapp-analytics.permissions.js';
import whatsappAnalyticsGet from '@/api/whatsapp-analytics.get.js';

const FIXTURES = [...ACCOUNT_FIXTURES, 'api/__tests__/fixtures/whatsapp-messages.js'];

beforeEach(async () => {
  await resetAndLoad(FIXTURES);
});

describe('GET /api/whatsapp-analytics', () => {
  it('cuenta enviados, entregados, leídos, fallidos y recibidos de la organización', async () => {
    const {response, errors} = await whatsappAnalyticsGet(buildAuthedEvent({url: '/?days=7', profile: OWNER}));

    expect(errors).toBeNull();
    expect(response.days).toBe(7);
    expect(response.totals).toEqual({queued: 0, sent: 3, delivered: 2, read: 1, failed: 1, received: 2, sentFromApp: 1});
    expect(response.daily).toHaveLength(7);
    expect(response.daily.reduce((total, day) => total + day.sent, 0)).toBe(3);
    expect(response.daily.reduce((total, day) => total + day.received, 0)).toBe(2);
  });

  it('el rango de 30 días incluye los mensajes más antiguos', async () => {
    const {response} = await whatsappAnalyticsGet(buildAuthedEvent({url: '/?days=30', profile: EMPLOYEE}));

    expect(response.totals.sent).toBe(4);
    expect(response.daily).toHaveLength(30);
  });

  it('cada clínica ve solo lo suyo', async () => {
    const {response} = await whatsappAnalyticsGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(response.totals).toMatchObject({sent: 1, received: 0});
  });

  it('un rango no permitido responde 400 y el superadmin no tiene el módulo', async () => {
    const invalid = buildAuthedEvent({url: '/?days=365', profile: OWNER});
    const superadmin = buildAuthedEvent({profile: SUPERADMIN});

    await whatsappAnalyticsGet(invalid);
    await whatsappAnalyticsGet(superadmin);

    expect(invalid.node.res.statusCode).toBe(400);
    expect(superadmin.node.res.statusCode).toBe(400);
  });
});
