import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {sessionsTable} from '@vetisuite/database/schemas/schemas.js';
import authCore, {isAccountBlocked} from '@/core/auth-core.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import {TEST_PASSWORD_PLAIN} from '@/tests/constants.js';
import {ACCOUNT_FIXTURES} from '@/api/__tests__/helpers/profiles.js';

const OWNER_USER = '662e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_USER = '662e8400-e29b-41d4-a716-446655440003';
const SUPERADMIN_USER = '662e8400-e29b-41d4-a716-446655440004';

describe('core/auth-core', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('crea una sesión y el token lleva solo su id firmado', async () => {
    const {session, token} = await authCore.session.create(OWNER_USER, {ip: '203.0.113.5', userAgent: 'agent'});

    expect(authCore.session.fromToken(token)).toEqual({session: session.id});
    expect(authCore.session.fromToken(`${token}x`)).toBeNull();
    expect(authCore.session.fromToken(null)).toBeNull();
  });

  it('el claim arma el perfil del rol con permisos y exige el mismo user-agent', async () => {
    const {session} = await authCore.session.create(EMPLOYEE_USER, {ip: '203.0.113.5', userAgent: 'agent'});

    const claimed = await authCore.session.claim(session.id, {userAgent: 'agent'});
    const otherAgent = await authCore.session.claim(session.id, {userAgent: 'otro'});

    expect(claimed.profile.firstName).toBe('Marta');
    expect(claimed.profile.position).toBe('veterinarian');
    expect(claimed.profile.user.role).toBe('employee');
    expect(claimed.profile.user.password).toBeUndefined();
    expect(claimed.permissions).toContain('employee::clients::general');
    expect(claimed.organization).toEqual({id: '552e8400-e29b-41d4-a716-446655440001', name: 'Clínica Norte', timezone: 'America/Guayaquil'});
    expect(otherAgent).toBeNull();
  });

  it('destroy borra la fila y el claim deja de resolver', async () => {
    const {session} = await authCore.session.create(SUPERADMIN_USER, {ip: '203.0.113.5', userAgent: 'agent'});

    await authCore.session.destroy(session.id);

    const rows = await db.select().from(sessionsTable).where(eq(sessionsTable.id, session.id));

    expect(rows).toEqual([]);
    expect(await authCore.session.claim(session.id, {userAgent: 'agent'})).toBeNull();
  });

  it('verifica credenciales con un solo resultado para correo o contraseña malos', async () => {
    const valid = await authCore.user.verifyCredentials('api.owner@test.com', TEST_PASSWORD_PLAIN);
    const wrongPassword = await authCore.user.verifyCredentials('api.owner@test.com', 'otra');
    const unknownEmail = await authCore.user.verifyCredentials('nadie@test.com', TEST_PASSWORD_PLAIN);

    expect(valid.id).toBe(OWNER_USER);
    expect(wrongPassword).toBeNull();
    expect(unknownEmail).toBeNull();
  });

  it('getProfile resuelve la tabla del rol', async () => {
    const owner = await authCore.user.getProfile(OWNER_USER);
    const superadmin = await authCore.user.getProfile(SUPERADMIN_USER);

    expect(owner.firstName).toBe('Ana');
    expect(superadmin.firstName).toBe('Sara');
    expect(owner.user.password).toBeUndefined();
  });

  it('isAccountBlocked mira disabled y bannedUntil', () => {
    const tomorrow = new Date(Date.now() + 86400000);
    const yesterday = new Date(Date.now() - 86400000);

    expect(isAccountBlocked({disabled: true})).toBe(true);
    expect(isAccountBlocked({disabled: false, bannedUntil: tomorrow})).toBe(true);
    expect(isAccountBlocked({disabled: false, bannedUntil: yesterday})).toBe(false);
    expect(isAccountBlocked({disabled: false, bannedUntil: null})).toBe(false);
  });
});
