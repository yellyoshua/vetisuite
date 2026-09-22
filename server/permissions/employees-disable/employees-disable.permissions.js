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

pkit.module('employees-disable').name('general').role('owner').registerActions({
  update: {enabled: true, properties: ['id', 'disabled']}
})
.hook('update', assertOrganizationEmployee);
