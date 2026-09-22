import _ from 'underscore';
import {db} from '@vetisuite/database/db.js';
import {eq, isNull} from '@vetisuite/database/orm.js';
import {permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import permissions from '@/permissions/permissions.js';

export default {
  description: 'Create the permissions row of every user without one, with every permission of its role',
  async execute () {
    const named = Object.keys(permissions.permissions.named);

    const users = await db.select({id: usersTable.id, role: usersTable.role})
    .from(usersTable)
    .leftJoin(permissionsTable, eq(permissionsTable.user, usersTable.id))
    .where(isNull(permissionsTable.id));

    for (const user of users) {
      const rolePermissions = _(named).filter((permission) => permission.startsWith(`${user.role}::`));

      await db.insert(permissionsTable).values({user: user.id, name: 'general', permissions: rolePermissions}).returning({id: permissionsTable.id});
    }
  }
};
