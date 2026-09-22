import {permissionsTable} from '@vetisuite/database/schemas/schemas.js';
import permissionsRegistry from '@/permissions/permissions.js';
import users from './users.js';

export const table = permissionsTable;

function rolePermissions (role) {
  return Object.keys(permissionsRegistry.permissions.named).filter((permission) => permission.startsWith(`${role}::`));
}

const rows = users.map((user) => ({user: user.id, name: 'general', permissions: rolePermissions(user.role)}));

export default rows;
