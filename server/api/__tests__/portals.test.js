import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/portals/portals.permissions.js';
import '@/permissions/portals-count/portals-count.permissions.js';
import portalsGet from '@/api/portals.get.js';
import portalsCountGet from '@/api/portals-count.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/portals.js',
  'api/__tests__/fixtures/portals-submission.js'
];

const OWN_PORTAL_1 = 'bb2e8400-e29b-41d4-a716-446655440001';
const OWN_PORTAL_2 = 'bb2e8400-e29b-41d4-a716-446655440002';
const FOREIGN_PORTAL = 'bb2e8400-e29b-41d4-a716-446655440003';

describe('GET /api/portals y /api/portals-count', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño lista los portales vigentes de su organización con bookedAppointments agregado', async () => {
    const {response, errors} = await portalsGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response.map((portal) => portal.id)).toEqual([OWN_PORTAL_1, OWN_PORTAL_2]);
    expect(response[0].organization).toBeUndefined();
    expect(response[0].name).toBe('Portal de la clínica');
    expect(response[0].slug).toBe('clinica');
    expect(response[0].purpose).toBe('booking');
    expect(response[0].status).toBe('published');
    expect(response[0].bookedAppointments).toBe(2);
    expect(response[1].name).toBe('Campaña de vacunación');
    expect(response[1].slug).toBe('vacunacion-2026');
    expect(response[1].purpose).toBe('capture');
    expect(response[1].status).toBe('draft');
    expect(response[1].bookedAppointments).toBe(0);
  });

  it('el empleado lista los de su organización y el dueño de otra organización los suyos', async () => {
    const employeeList = await portalsGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerList = await portalsGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeList.response).toHaveLength(2);
    expect(otherOwnerList.response.map((portal) => portal.id)).toEqual([FOREIGN_PORTAL]);
  });

  it('filtra por propósito', async () => {
    const {response} = await portalsGet(buildAuthedEvent({url: '/?purpose=booking', profile: OWNER}));

    expect(response.map((portal) => portal.id)).toEqual([OWN_PORTAL_1]);
  });

  it('filtra por estado', async () => {
    const {response} = await portalsGet(buildAuthedEvent({url: '/?status=draft', profile: OWNER}));

    expect(response.map((portal) => portal.id)).toEqual([OWN_PORTAL_2]);
  });

  it('filtra por preset publicado y borrador', async () => {
    const published = await portalsGet(buildAuthedEvent({url: '/?preset=published', profile: OWNER}));
    const drafts = await portalsGet(buildAuthedEvent({url: '/?preset=drafts', profile: OWNER}));

    expect(published.response.map((portal) => portal.id)).toEqual([OWN_PORTAL_1]);
    expect(drafts.response.map((portal) => portal.id)).toEqual([OWN_PORTAL_2]);
  });

  it('busca por nombre y slug', async () => {
    const byName = await portalsGet(buildAuthedEvent({url: '/?search=vacunacion', profile: OWNER}));
    const bySlug = await portalsGet(buildAuthedEvent({url: '/?search=clinica', profile: OWNER}));

    expect(byName.response.map((portal) => portal.id)).toEqual([OWN_PORTAL_2]);
    expect(bySlug.response.map((portal) => portal.id)).toEqual([OWN_PORTAL_1]);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await portalsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('consultar un portal de otra organización devuelve lista vacía', async () => {
    const {response} = await portalsGet(buildAuthedEvent({url: `/?id=${FOREIGN_PORTAL}`, profile: OWNER}));

    expect(response).toEqual([]);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?organization=552e8400-e29b-41d4-a716-446655440002', profile: OWNER});

    await portalsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await portalsGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });

  it('cuenta los portales vigentes de la organización, con filtros', async () => {
    const all = await portalsCountGet(buildAuthedEvent({profile: OWNER}));
    const byPurpose = await portalsCountGet(buildAuthedEvent({url: '/?purpose=booking', profile: OWNER}));
    const byPreset = await portalsCountGet(buildAuthedEvent({url: '/?preset=drafts', profile: OWNER}));
    const bySearch = await portalsCountGet(buildAuthedEvent({url: '/?search=clinica', profile: EMPLOYEE}));

    expect(all.response).toEqual({value: 2});
    expect(byPurpose.response).toEqual({value: 1});
    expect(byPreset.response).toEqual({value: 1});
    expect(bySearch.response).toEqual({value: 1});
  });
});
