import _ from 'underscore';
import {db} from '@vetisuite/database/db.js';
import {eq} from '@vetisuite/database/orm.js';
import {permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

const PERMISSIONS_BY_ROLE = {
  owner: [
    'owner::appointments::general',
    'owner::appointments-count::general',
    'owner::appointments-availability::general',
    'owner::visits::general',
    'owner::visits-count::general',
    'owner::visits-status::general',
    'owner::inventory::general',
    'owner::inventory-count::general',
    'owner::visits-grooming::general',
    'owner::visits-grooming-count::general',
    'owner::clinic::general',
    'owner::clinic-count::general',
    'owner::billing::general',
    'owner::billing-count::general',
    'owner::finance::general',
    'owner::portals::general',
    'owner::portals-count::general'
  ],
  employee: [
    'employee::appointments::general',
    'employee::appointments-count::general',
    'employee::appointments-availability::general',
    'employee::visits::general',
    'employee::visits-count::general',
    'employee::visits-status::general',
    'employee::inventory::general',
    'employee::inventory-count::general',
    'employee::visits-grooming::general',
    'employee::visits-grooming-count::general',
    'employee::clinic::general',
    'employee::clinic-count::general',
    'employee::billing::general',
    'employee::billing-count::general',
    'employee::finance::general',
    'employee::portals::general',
    'employee::portals-count::general'
  ]
};

export default {
  description: 'Attach wave 2 permissions to owner and employee users',
  async execute () {
    for (const [role, identifiers] of Object.entries(PERMISSIONS_BY_ROLE)) {
      const rows = await db.select({id: permissionsTable.id, permissions: permissionsTable.permissions})
      .from(permissionsTable)
      .innerJoin(usersTable, eq(permissionsTable.user, usersTable.id))
      .where(eq(usersTable.role, role));

      for (const row of rows) {
        await db.update(permissionsTable)
        .set({permissions: _.union(row.permissions, identifiers), updatedAt: new Date()})
        .where(eq(permissionsTable.id, row.id))
        .returning({id: permissionsTable.id});
      }
    }
  }
};
