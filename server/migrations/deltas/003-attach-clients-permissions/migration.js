import _ from 'underscore';
import {db} from '@vetisuite/database/db.js';
import {eq} from '@vetisuite/database/orm.js';
import {permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

const PERMISSIONS_BY_ROLE = {
  owner: ['owner::clients::general', 'owner::clients-count::general', 'owner::clients-patients::general'],
  employee: ['employee::clients::general', 'employee::clients-count::general', 'employee::clients-patients::general']
};

export default {
  description: 'Attach clients, clients-count and clients-patients permissions to owner and employee users',
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
