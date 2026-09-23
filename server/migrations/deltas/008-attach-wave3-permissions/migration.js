import _ from 'underscore';
import {db} from '@vetisuite/database/db.js';
import {eq} from '@vetisuite/database/orm.js';
import {permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

const PERMISSIONS_BY_ROLE = {
  owner: [
    'owner::dashboard-reception::general',
    'owner::dashboard-care::general',
    'owner::dashboard-grooming::general',
    'owner::dashboard-laboratory::general',
    'owner::dashboard-inventory::general',
    'owner::dashboard-billing::general',
    'owner::dashboard-marketing::general',
    'owner::dashboard-administration::general'
  ],
  employee: [
    'employee::dashboard-reception::general',
    'employee::dashboard-care::general',
    'employee::dashboard-grooming::general',
    'employee::dashboard-laboratory::general',
    'employee::dashboard-inventory::general',
    'employee::dashboard-billing::general',
    'employee::dashboard-marketing::general'
  ]
};

export default {
  description: 'Attach wave 3 dashboard permissions to owner and employee users',
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
