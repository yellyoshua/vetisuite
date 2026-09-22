import {pkit} from '../pkit.config.js';

pkit.module('owners-disable').name('general').role('superadmin').registerActions({
  update: {enabled: true, properties: ['id', 'disabled']}
});
