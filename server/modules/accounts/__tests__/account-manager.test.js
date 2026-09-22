import {beforeEach, describe, expect, it, vi} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {employeesTable, permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import events from '@/utils/events.js';
import {isPasswordValid} from '@/utils/hashing.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import {ACCOUNT_FIXTURES} from '@/api/__tests__/helpers/profiles.js';
import {createEmployeeAccount, updateEmployeeAccount} from '@/modules/accounts/accounts.service.js';

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const EMPLOYEE_ID = '772e8400-e29b-41d4-a716-446655440003';
const EMPLOYEE_USER = '662e8400-e29b-41d4-a716-446655440003';

describe('modules/accounts', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('generate crea usuario, perfil, permisos del rol y publica account_created', async () => {
    const account = await createEmployeeAccount({
      organization: NORTH,
      firstName: 'Nuevo',
      lastName: 'Empleado',
      position: 'receptionist',
      user: {email: 'NUEVO@test.com', password: 'secreta123'}
    }, {requestId: 'r1'});

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, account.user.id));
    const [employee] = await db.select().from(employeesTable).where(eq(employeesTable.id, account.id));
    const [permissions] = await db.select().from(permissionsTable).where(eq(permissionsTable.user, user.id));

    expect(user).toMatchObject({email: 'nuevo@test.com', role: 'employee', organization: NORTH, disabled: false});
    expect(await isPasswordValid('secreta123', user.password)).toBe(true);
    expect(employee.user).toBe(user.id);
    expect(permissions.name).toBe('general');
    expect(events.emailAccountManager.publish).toHaveBeenCalledWith({action: 'account_created', userId: user.id, email: 'nuevo@test.com'}, {requestId: 'r1'});
  });

  it('un formulario inválido es 400 con los campos', async () => {
    await expect(createEmployeeAccount({organization: 'x', firstName: 'N', user: {email: 'mal'}}, {requestId: 'r2'}))
    .rejects.toMatchObject({error: 'errors.invalid_form', status: 400, fields: expect.arrayContaining(['organization', 'firstName', 'lastName', 'position', 'user'])});
  });

  it('update deshabilita y publica account_disabled una sola vez', async () => {
    await updateEmployeeAccount({id: EMPLOYEE_ID, user: {disabled: true}}, {requestId: 'r3'});
    await updateEmployeeAccount({id: EMPLOYEE_ID, user: {disabled: true}}, {requestId: 'r4'});

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, EMPLOYEE_USER));

    expect(user.disabled).toBe(true);
    expect(events.emailAccountManager.publish).toHaveBeenCalledTimes(1);
    expect(events.emailAccountManager.publish).toHaveBeenCalledWith({action: 'account_disabled', email: 'api.employee@test.com'}, {requestId: 'r3'});
  });

  it('update de un perfil inexistente es 404', async () => {
    await expect(updateEmployeeAccount({id: '772e8400-e29b-41d4-a716-446655440099', firstName: 'Nadie', user: {}}, {requestId: 'r5'}))
    .rejects.toEqual({error: 'Perfil no encontrado', status: 404});
  });
});
