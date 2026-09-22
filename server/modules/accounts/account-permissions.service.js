import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {employeesTable, ownersTable, permissionsTable, superadminsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';

function accountPermissions (profileTable) {
  return {
    async find (id) {
      const [row] = await db.select({
        id: profileTable.id,
        firstName: profileTable.firstName,
        lastName: profileTable.lastName,
        userId: usersTable.id,
        userEmail: usersTable.email,
        userRole: usersTable.role,
        permissions: permissionsTable.permissions
      })
      .from(profileTable)
      .innerJoin(usersTable, eq(profileTable.user, usersTable.id))
      .innerJoin(permissionsTable, eq(permissionsTable.user, usersTable.id))
      .where(eq(profileTable.id, id))
      .limit(1);

      if (!row) {
        throw {error: 'errors.not_found', status: 404};
      }

      return {
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        user: {id: row.userId, email: row.userEmail, role: row.userRole},
        permissions: row.permissions
      };
    },
    async update (id, permissions) {
      const [account] = await db.select({user: profileTable.user})
      .from(profileTable)
      .where(eq(profileTable.id, id))
      .limit(1);

      if (!account) {
        throw {error: 'El usuario no tiene registro de permisos', status: 404};
      }

      const [updated] = await db.update(permissionsTable)
      .set({permissions, updatedAt: new Date()})
      .where(eq(permissionsTable.user, account.user))
      .returning();

      if (!updated) {
        throw {error: 'El usuario no tiene registro de permisos', status: 404};
      }

      return updated;
    }
  };
}

export const superadminPermissions = accountPermissions(superadminsTable);
export const ownerPermissions = accountPermissions(ownersTable);
export const employeePermissions = accountPermissions(employeesTable);
