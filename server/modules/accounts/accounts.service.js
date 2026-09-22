import accountManager from './account-manager.js';
import {employeesTable, ownersTable, superadminsTable} from '@vetisuite/database/schemas/schemas.js';
import {
  createEmployeeAccountSchema, updateEmployeeAccountSchema,
  createOwnerAccountSchema, updateOwnerAccountSchema,
  createSuperadminAccountSchema, updateSuperadminAccountSchema
} from './accounts.schema.js';

const superadminAccountManager = accountManager({
  profileTable: superadminsTable,
  role: 'superadmin',
  create: {schema: createSuperadminAccountSchema},
  update: {schema: updateSuperadminAccountSchema}
});

const ownerAccountManager = accountManager({
  profileTable: ownersTable,
  role: 'owner',
  create: {schema: createOwnerAccountSchema},
  update: {schema: updateOwnerAccountSchema}
});

const employeeAccountManager = accountManager({
  profileTable: employeesTable,
  role: 'employee',
  create: {schema: createEmployeeAccountSchema},
  update: {schema: updateEmployeeAccountSchema}
});

export const createSuperadminAccount = superadminAccountManager.generate;
export const updateSuperadminAccount = superadminAccountManager.update;

export const createOwnerAccount = ownerAccountManager.generate;
export const updateOwnerAccount = ownerAccountManager.update;

export const createEmployeeAccount = employeeAccountManager.generate;
export const updateEmployeeAccount = employeeAccountManager.update;
