import {pkit} from '../pkit.config.js';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {employeesTable} from '@vetisuite/database/schemas/schemas.js';

async function assertOrganizationEmployee (data, context) {
  const [employee] = await db.select({organization: employeesTable.organization})
  .from(employeesTable)
  .where(eq(employeesTable.id, data.id))
  .limit(1);

  if (!employee || employee.organization !== context.profile.organization) {
    throw {error: 'Empleado no encontrado', status: 404};
  }
}

pkit.module('employees').name('general').role('owner').registerActions({
  find: {enabled: true, properties: ['id', 'avatar', 'firstName', 'lastName', 'phone', 'position', 'color', 'createdAt', 'updatedAt', 'user', 'search']},
  create: {enabled: true, properties: ['firstName', 'lastName', 'email', 'password', 'phone', 'position', 'color']},
  update: {enabled: true, properties: ['id', 'firstName', 'lastName', 'phone', 'position', 'color']}
})
.hook('update', assertOrganizationEmployee);
