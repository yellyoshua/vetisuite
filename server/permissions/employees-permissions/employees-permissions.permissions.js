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

function assertEmployeeRolePermissions (data) {
  for (const permission of data.permissions || []) {
    if (!String(permission).startsWith('employee::')) {
      throw {error: `El permiso ${permission} no corresponde al rol employee`, status: 400};
    }
  }
}

pkit.module('employees-permissions').name('general').role('owner').registerActions({
  find: {enabled: true, properties: ['id']},
  update: {enabled: true, properties: ['id', 'permissions']}
})
.hook('find', assertOrganizationEmployee)
.hook('update', assertOrganizationEmployee)
.hook('update', assertEmployeeRolePermissions);
