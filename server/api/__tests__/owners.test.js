import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import ownersGet from '@/api/owners.get.js';
import ownersPost from '@/api/owners.post.js';
import ownersPut from '@/api/owners.put.js';
import ownersDisable from '@/api/owners-disable.put.js';
import permissionsGet from '@/api/owners-permissions.get.js';
import permissionsPut from '@/api/owners-permissions.put.js';

describe('/api/owners', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('el superadmin lista dueños de todas las organizaciones', async () => {
    const {response} = await ownersGet(buildAuthedEvent({profile: SUPERADMIN}));

    expect(response.map((owner) => owner.organization.slug).sort()).toEqual(['clinica-norte', 'clinica-sur']);
    expect(response[0].user.password).toBeUndefined();
  });

  it('un dueño no gestiona dueños', async () => {
    const event = buildAuthedEvent({profile: OWNER});

    await ownersGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('crea un dueño en una organización existente y 404 si no existe', async () => {
    const {response} = await ownersPost(buildAuthedEvent({method: 'POST', body: {organization: OTHER_OWNER.organization, firstName: 'Segundo', lastName: 'Dueño', email: 'segundo@test.com', password: 'secreta123'}, profile: SUPERADMIN}));
    const missing = buildAuthedEvent({method: 'POST', body: {organization: '552e8400-e29b-41d4-a716-446655440099', firstName: 'Nadie', lastName: 'Nada', email: 'nadie@test.com', password: 'secreta123'}, profile: SUPERADMIN});

    await ownersPost(missing);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, 'segundo@test.com'));

    expect(response.organization.id).toBe(OTHER_OWNER.organization);
    expect(user.organization).toBe(OTHER_OWNER.organization);
    expect(missing.node.res.statusCode).toBe(404);
    expect(responseBody(missing).errors).toEqual(['Organización no encontrada']);
  });

  it('edita y deshabilita a un dueño', async () => {
    const {response} = await ownersPut(buildAuthedEvent({method: 'PUT', body: {id: OTHER_OWNER.id, occupation: 'Veterinario'}, profile: SUPERADMIN}));
    const disabled = await ownersDisable(buildAuthedEvent({method: 'PUT', body: {id: OTHER_OWNER.id, disabled: true}, profile: SUPERADMIN}));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, OTHER_OWNER.user.id));

    expect(response.occupation).toBe('Veterinario');
    expect(disabled.response).toEqual({success: true});
    expect(user.disabled).toBe(true);
  });

  it('un perfil inexistente es 404', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {id: '772e8400-e29b-41d4-a716-446655440099', firstName: 'Nadie'}, profile: SUPERADMIN});

    await ownersPut(event);

    expect(event.node.res.statusCode).toBe(404);
  });

  it('lee y recorta permisos de un dueño solo con identificadores owner::', async () => {
    const read = await permissionsGet(buildAuthedEvent({url: `/?id=${OWNER.id}`, profile: SUPERADMIN}));
    const trimmed = await permissionsPut(buildAuthedEvent({method: 'PUT', body: {id: OWNER.id, permissions: ['owner::profile::general', 'owner::clients::general']}, profile: SUPERADMIN}));
    const otherRole = buildAuthedEvent({method: 'PUT', body: {id: OWNER.id, permissions: ['employee::profile::general']}, profile: SUPERADMIN});

    await permissionsPut(otherRole);

    const [row] = await db.select().from(permissionsTable).where(eq(permissionsTable.user, OWNER.user.id));

    expect(read.response.permissions).toContain('owner::employees::general');
    expect(trimmed.response.permissions).toEqual(['owner::profile::general', 'owner::clients::general']);
    expect(row.permissions).toEqual(['owner::profile::general', 'owner::clients::general']);
    expect(otherRole.node.res.statusCode).toBe(400);
  });
});
