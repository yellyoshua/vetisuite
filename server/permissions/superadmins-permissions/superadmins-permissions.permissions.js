import {pkit} from '../pkit.config.js';

function assertNotOwnAccount (data, context) {
  if (data.id === context.profile.id) {
    throw {error: 'No puedes modificar tus propios permisos', status: 403};
  }
}

function assertSuperadminRolePermissions (data) {
  for (const permission of data.permissions || []) {
    if (!String(permission).startsWith('superadmin::')) {
      throw {error: `El permiso ${permission} no corresponde al rol superadmin`, status: 400};
    }
  }
}

pkit.module('superadmins-permissions').name('general').role('superadmin').registerActions({
  find: {enabled: true, properties: ['id']},
  update: {enabled: true, properties: ['id', 'permissions']}
})
.hook('update', assertNotOwnAccount)
.hook('update', assertSuperadminRolePermissions);
