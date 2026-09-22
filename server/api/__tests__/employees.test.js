import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {employeesTable, permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, DISABLED_EMPLOYEE_ID, EMPLOYEE, OTHER_EMPLOYEE, OTHER_OWNER, OWNER} from './helpers/profiles.js';
import employeesGet from '@/api/employees.get.js';
import employeesPost from '@/api/employees.post.js';
import employeesPut from '@/api/employees.put.js';
import employeesDisable from '@/api/employees-disable.put.js';
import permissionsGet from '@/api/employees-permissions.get.js';
import permissionsPut from '@/api/employees-permissions.put.js';

async function findEmployee (id) {
  const [employee] = await db.select().from(employeesTable).where(eq(employeesTable.id, id));

  return employee;
}

describe('/api/employees', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('el dueño lista solo el personal de su organización', async () => {
    const own = await employeesGet(buildAuthedEvent({profile: OWNER}));
    const other = await employeesGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(own.response.map((employee) => employee.id).sort()).toEqual([EMPLOYEE.id, DISABLED_EMPLOYEE_ID].sort());
    expect(other.response.map((employee) => employee.id)).toEqual([OTHER_EMPLOYEE.id]);
    expect(own.response[0].organization).toBeUndefined();
  });

  it('un empleado no gestiona personal y una clave no declarada es 400', async () => {
    const byEmployee = buildAuthedEvent({profile: EMPLOYEE});
    const undeclared = buildAuthedEvent({url: `/?organization=${OTHER_OWNER.organization}`, profile: OWNER});

    await employeesGet(byEmployee);
    await employeesGet(undeclared);

    expect(byEmployee.node.res.statusCode).toBe(400);
    expect(undeclared.node.res.statusCode).toBe(400);
  });

  it('crea personal en la organización de la sesión con los permisos del rol', async () => {
    const {response} = await employeesPost(buildAuthedEvent({method: 'POST', body: {firstName: 'Lía', lastName: 'Ríos', email: 'lia@test.com', password: 'secreta123', position: 'groomer', color: '#aa00ff'}, profile: OWNER}));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, 'lia@test.com'));
    const [permissions] = await db.select().from(permissionsTable).where(eq(permissionsTable.user, user.id));

    expect(response.position).toBe('groomer');
    expect(response.user.email).toBe('lia@test.com');
    expect(user.organization).toBe(OWNER.organization);
    expect(permissions.permissions).toContain('employee::clients::general');
    expect(permissions.permissions.every((permission) => permission.startsWith('employee::'))).toBe(true);
  });

  it('valida puesto y color', async () => {
    const event = buildAuthedEvent({method: 'POST', body: {firstName: 'Lía', lastName: 'Ríos', email: 'lia@test.com', password: 'secreta123', position: 'jefe', color: 'rojo'}, profile: OWNER});

    await employeesPost(event);

    expect(responseBody(event).fields.sort()).toEqual(['color', 'position']);
  });

  it('edita personal propio y responde 404 con personal ajeno', async () => {
    const {response} = await employeesPut(buildAuthedEvent({method: 'PUT', body: {id: EMPLOYEE.id, position: 'receptionist'}, profile: OWNER}));
    const foreign = buildAuthedEvent({method: 'PUT', body: {id: OTHER_EMPLOYEE.id, position: 'receptionist'}, profile: OWNER});

    await employeesPut(foreign);

    expect(response.position).toBe('receptionist');
    expect(foreign.node.res.statusCode).toBe(404);
    expect((await findEmployee(OTHER_EMPLOYEE.id)).position).toBe('groomer');
  });

  it('deshabilita personal propio y no el ajeno', async () => {
    const own = await employeesDisable(buildAuthedEvent({method: 'PUT', body: {id: EMPLOYEE.id, disabled: true}, profile: OWNER}));
    const foreign = buildAuthedEvent({method: 'PUT', body: {id: OTHER_EMPLOYEE.id, disabled: true}, profile: OWNER});

    await employeesDisable(foreign);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, EMPLOYEE.user.id));

    expect(own.response).toEqual({success: true});
    expect(user.disabled).toBe(true);
    expect(foreign.node.res.statusCode).toBe(404);
  });

  it('gestiona permisos del personal propio con identificadores employee::', async () => {
    const read = await permissionsGet(buildAuthedEvent({url: `/?id=${EMPLOYEE.id}`, profile: OWNER}));
    const trimmed = await permissionsPut(buildAuthedEvent({method: 'PUT', body: {id: EMPLOYEE.id, permissions: ['employee::profile::general']}, profile: OWNER}));
    const foreignRead = buildAuthedEvent({url: `/?id=${OTHER_EMPLOYEE.id}`, profile: OWNER});
    const escalation = buildAuthedEvent({method: 'PUT', body: {id: EMPLOYEE.id, permissions: ['owner::employees::general']}, profile: OWNER});

    await permissionsGet(foreignRead);
    await permissionsPut(escalation);

    expect(read.response.permissions).toContain('employee::clients::general');
    expect(trimmed.response.permissions).toEqual(['employee::profile::general']);
    expect(foreignRead.node.res.statusCode).toBe(404);
    expect(escalation.node.res.statusCode).toBe(400);
  });
});
