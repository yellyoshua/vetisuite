import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {organizationsTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/organization/organization.permissions.js';
import organizationGet from '@/api/organization.get.js';
import organizationPut from '@/api/organization.put.js';

async function findTimezone (id) {
  const [organization] = await db.select({timezone: organizationsTable.timezone})
  .from(organizationsTable)
  .where(eq(organizationsTable.id, id));

  return organization.timezone;
}

describe('GET /api/organization', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('el dueño obtiene su organización con la zona horaria', async () => {
    const {response, errors} = await organizationGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toEqual({id: OWNER.organization, name: 'Clínica Norte', timezone: 'America/Guayaquil'});
  });

  it('el empleado obtiene la suya y el dueño de otra organización la suya', async () => {
    const employeeResult = await organizationGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerResult = await organizationGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeResult.response.id).toBe(OWNER.organization);
    expect(otherOwnerResult.response).toEqual({id: OTHER_OWNER.organization, name: 'Clínica Sur', timezone: 'America/Bogota'});
  });

  it('el id de la query no elige la organización', async () => {
    const {response} = await organizationGet(buildAuthedEvent({url: `/?id=${OTHER_OWNER.organization}`, profile: OWNER}));

    expect(response.id).toBe(OWNER.organization);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await organizationGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: `/?organization=${OTHER_OWNER.organization}`, profile: OWNER});

    await organizationGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});

describe('PUT /api/organization', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('el empleado cambia la zona horaria de su organización', async () => {
    const {response, errors} = await organizationPut(buildAuthedEvent({method: 'PUT', body: {timezone: 'Europe/Madrid'}, profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response).toEqual({id: OWNER.organization, name: 'Clínica Norte', timezone: 'Europe/Madrid'});
    expect(await findTimezone(OWNER.organization)).toBe('Europe/Madrid');
    expect(await findTimezone(OTHER_OWNER.organization)).toBe('America/Bogota');
  });

  it('el dueño puede volver a UTC', async () => {
    const {response} = await organizationPut(buildAuthedEvent({method: 'PUT', body: {timezone: 'UTC'}, profile: OWNER}));

    expect(response.timezone).toBe('UTC');
  });

  it('una zona horaria desconocida responde 400 con el campo y no toca la fila', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {timezone: 'Mars/Olympus'}, profile: OWNER});

    await organizationPut(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['timezone']);
    expect(await findTimezone(OWNER.organization)).toBe('America/Guayaquil');
  });

  it('el id del body no elige la organización', async () => {
    const {response} = await organizationPut(buildAuthedEvent({
      method: 'PUT',
      body: {id: OTHER_OWNER.organization, timezone: 'Europe/Madrid'},
      profile: OWNER
    }));

    expect(response.id).toBe(OWNER.organization);
    expect(await findTimezone(OTHER_OWNER.organization)).toBe('America/Bogota');
  });

  it('la organización o el nombre no se aceptan desde el body', async () => {
    const withOrganization = buildAuthedEvent({method: 'PUT', body: {organization: OTHER_OWNER.organization, timezone: 'Europe/Madrid'}, profile: OWNER});
    const withName = buildAuthedEvent({method: 'PUT', body: {name: 'Otro nombre', timezone: 'Europe/Madrid'}, profile: OWNER});

    await organizationPut(withOrganization);
    await organizationPut(withName);

    expect(withOrganization.node.res.statusCode).toBe(400);
    expect(withName.node.res.statusCode).toBe(400);
    expect(await findTimezone(OWNER.organization)).toBe('America/Guayaquil');
    expect(await findTimezone(OTHER_OWNER.organization)).toBe('America/Bogota');
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {timezone: 'UTC'}, profile: SUPERADMIN});

    await organizationPut(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
