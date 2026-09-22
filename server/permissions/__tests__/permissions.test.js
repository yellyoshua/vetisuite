import {beforeEach, describe, expect, it} from 'vitest';
import permissions from '@/permissions/permissions.js';
import {resetAndLoad} from '@/tests/fixtures.js';

const SUPERADMIN = {id: '772e8400-e29b-41d4-a716-446655440004', user: {id: '662e8400-e29b-41d4-a716-446655440004', role: 'superadmin'}};
const OWNER = {id: '772e8400-e29b-41d4-a716-446655440005', avatar: 'images/662e8400-e29b-41d4-a716-446655440005/a.foto.png', user: {id: '662e8400-e29b-41d4-a716-446655440005', role: 'owner'}};

function validate (input) {
  return permissions.validate(input);
}

describe('registro de permisos', () => {
  it('compila el registro sin lanzar', () => {
    expect(() => permissions.permissions.named).not.toThrow();
  });

  it('declara los mismos módulos base para los tres roles', () => {
    const named = Object.keys(permissions.permissions.named);

    ['superadmin', 'owner', 'employee'].forEach((role) => {
      expect(named).toContain(`${role}::profile::general`);
      expect(named).toContain(`${role}::uploads::general`);
      expect(named).toContain(`${role}::auth-logout::general`);
    });
  });

  it('valida una lectura del empleado', async () => {
    const validation = await validate({
      action: 'profile-sessions',
      method: 'find',
      role: 'employee',
      permissions: ['employee::profile-sessions::general'],
      data: {id: '772e8400-e29b-41d4-a716-446655440001'}
    });

    expect(validation.errors).toEqual([]);
  });

  it('rechaza una clave no declarada', async () => {
    const validation = await validate({
      action: 'uploads',
      method: 'create',
      role: 'owner',
      permissions: ['owner::uploads::general'],
      data: {name: 'a.png', size: 1, user: 'otro-usuario'}
    });

    expect(validation.errors[0].code).toBe('PROPERTIES_NOT_ALLOWED');
  });

  it('rechaza un rol que no tiene el módulo registrado', async () => {
    const validation = await validate({
      action: 'owners',
      method: 'find',
      role: 'employee',
      permissions: ['employee::profile::general'],
      data: {}
    });

    expect(validation.errors.length).toBeGreaterThan(0);
  });
});

describe('hooks del registro', () => {
  it('el superadmin no puede deshabilitar su propia cuenta', async () => {
    const validation = await validate({
      action: 'superadmins-disable',
      method: 'update',
      role: 'superadmin',
      permissions: ['superadmin::superadmins-disable::general'],
      data: {id: SUPERADMIN.id, disabled: true},
      context: {profile: SUPERADMIN}
    });

    expect(validation.errors[0].cause).toEqual({error: 'No puedes deshabilitar tu propia cuenta', status: 403});
  });

  it('el superadmin no puede editar sus propios permisos', async () => {
    const validation = await validate({
      action: 'superadmins-permissions',
      method: 'update',
      role: 'superadmin',
      permissions: ['superadmin::superadmins-permissions::general'],
      data: {id: SUPERADMIN.id, permissions: ['superadmin::profile::general']},
      context: {profile: SUPERADMIN}
    });

    expect(validation.errors[0].cause).toEqual({error: 'No puedes modificar tus propios permisos', status: 403});
  });

  it('a un superadmin no se le asignan permisos de otro rol', async () => {
    const validation = await validate({
      action: 'superadmins-permissions',
      method: 'update',
      role: 'superadmin',
      permissions: ['superadmin::superadmins-permissions::general'],
      data: {id: '772e8400-e29b-41d4-a716-446655440099', permissions: ['owner::profile::general']},
      context: {profile: SUPERADMIN}
    });

    expect(validation.errors[0].cause).toEqual({error: 'El permiso owner::profile::general no corresponde al rol superadmin', status: 400});
  });

  it('a un dueño no se le asignan permisos de otro rol', async () => {
    const validation = await validate({
      action: 'owners-permissions',
      method: 'update',
      role: 'superadmin',
      permissions: ['superadmin::owners-permissions::general'],
      data: {id: OWNER.id, permissions: ['employee::profile::general']},
      context: {profile: SUPERADMIN}
    });

    expect(validation.errors[0].cause.status).toBe(400);
  });

  it('el perfil acepta la foto actual o una temporal propia y rechaza la de otra cuenta', async () => {
    const base = {action: 'profile', method: 'update', role: 'owner', permissions: ['owner::profile::general'], context: {profile: OWNER}};

    const current = await validate({...base, data: {avatar: OWNER.avatar}});
    const uploaded = await validate({...base, data: {avatar: `temporal/${OWNER.user.id}/b.foto.png`}});
    const foreign = await validate({...base, data: {avatar: 'temporal/662e8400-e29b-41d4-a716-446655440001/c.foto.png'}});

    expect(current.errors).toEqual([]);
    expect(uploaded.errors).toEqual([]);
    expect(foreign.errors[0].cause).toEqual({error: 'La foto no pertenece a esta cuenta', status: 403});
  });
});

describe('hooks que consultan la base', () => {
  const FIXTURES = [
    'api/__tests__/fixtures/organizations.js',
    'api/__tests__/fixtures/users.js',
    'api/__tests__/fixtures/owners.js',
    'api/__tests__/fixtures/employees.js',
    'api/__tests__/fixtures/sessions.js',
    'api/__tests__/fixtures/clients.js',
    'api/__tests__/fixtures/patients.js'
  ];
  const NORTH_OWNER = {id: '772e8400-e29b-41d4-a716-446655440001', organization: '552e8400-e29b-41d4-a716-446655440001', user: {id: '662e8400-e29b-41d4-a716-446655440001', role: 'owner'}};

  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('un cliente de otra organización es 404 al editarlo', async () => {
    const validation = await validate({
      action: 'clients',
      method: 'update',
      role: 'owner',
      permissions: ['owner::clients::general'],
      data: {id: '992e8400-e29b-41d4-a716-446655440003', name: 'x'},
      context: {profile: NORTH_OWNER}
    });

    expect(validation.errors[0].cause).toEqual({error: 'Cliente no encontrado', status: 404});
  });

  it('un paciente no se registra sobre un cliente ajeno', async () => {
    const validation = await validate({
      action: 'clients-patients',
      method: 'create',
      role: 'owner',
      permissions: ['owner::clients-patients::general'],
      data: {client: '992e8400-e29b-41d4-a716-446655440003', name: 'x', species: 'dog'},
      context: {profile: NORTH_OWNER}
    });

    expect(validation.errors[0].cause).toEqual({error: 'Cliente no encontrado', status: 404});
  });

  it('un empleado de otra organización es 404 para el dueño', async () => {
    const validation = await validate({
      action: 'employees-disable',
      method: 'update',
      role: 'owner',
      permissions: ['owner::employees-disable::general'],
      data: {id: '772e8400-e29b-41d4-a716-446655440005', disabled: true},
      context: {profile: NORTH_OWNER}
    });

    expect(validation.errors[0].cause).toEqual({error: 'Empleado no encontrado', status: 404});
  });

  it('una sesión de otro usuario es 404 al revocarla', async () => {
    const validation = await validate({
      action: 'profile-sessions',
      method: 'remove',
      role: 'owner',
      permissions: ['owner::profile-sessions::general'],
      data: {id: '882e8400-e29b-41d4-a716-446655440005'},
      context: {profile: NORTH_OWNER}
    });

    expect(validation.errors[0].cause).toEqual({error: 'Sesión no encontrada', status: 404});
  });
});
