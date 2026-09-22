import {pkit} from '../pkit.config.js';

function assertOwnerRolePermissions (data) {
  for (const permission of data.permissions || []) {
    if (!String(permission).startsWith('owner::')) {
      throw {error: `El permiso ${permission} no corresponde al rol owner`, status: 400};
    }
  }
}

pkit.module('owners-permissions').name('general').role('superadmin').registerActions({
  find: {enabled: true, properties: ['id']},
  update: {enabled: true, properties: ['id', 'permissions']}
})
.hook('update', assertOwnerRolePermissions);
