import {pkit} from '../pkit.config.js';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {visitsTable} from '@vetisuite/database/schemas/schemas.js';

async function assertOrganizationVisit (data, context) {
  const [visit] = await db.select({organization: visitsTable.organization, archivedAt: visitsTable.archivedAt})
  .from(visitsTable)
  .where(eq(visitsTable.id, data.id))
  .limit(1);

  if (!visit || visit.archivedAt || visit.organization !== context.profile.organization) {
    throw {error: 'Visita no encontrada', status: 404};
  }
}

const visitsStatus = pkit.module('visits-status').name('general');

visitsStatus.role('owner').registerActions({
  update: {enabled: true, properties: ['id', 'status']}
})
.hook('update', assertOrganizationVisit);

visitsStatus.role('employee').registerActions({
  update: {enabled: true, properties: ['id', 'status']}
})
.hook('update', assertOrganizationVisit);
