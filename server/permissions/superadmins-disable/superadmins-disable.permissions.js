import {pkit} from '../pkit.config.js';

function assertNotOwnAccount (data, context) {
  if (data.id === context.profile.id) {
    throw {error: 'No puedes deshabilitar tu propia cuenta', status: 403};
  }
}

pkit.module('superadmins-disable').name('general').role('superadmin').registerActions({
  update: {enabled: true, properties: ['id', 'disabled']}
})
.hook('update', assertNotOwnAccount);
