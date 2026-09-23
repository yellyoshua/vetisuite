import {pkit} from '../pkit.config.js';

const clinicCountProperties = ['id', 'search', 'kind', 'status', 'preset'];

const clinicCount = pkit.module('clinic-count').name('general');

clinicCount.role('owner').registerActions({
  find: {enabled: true, properties: clinicCountProperties}
});

clinicCount.role('employee').registerActions({
  find: {enabled: true, properties: clinicCountProperties}
});
