import {pkit} from '../pkit.config.js';

const groomingProperties = ['id', 'page', 'limit', 'search', 'order', 'status', 'preset'];

const visitsGrooming = pkit.module('visits-grooming').name('general');

visitsGrooming.role('owner').registerActions({
  find: {enabled: true, properties: groomingProperties}
});

visitsGrooming.role('employee').registerActions({
  find: {enabled: true, properties: groomingProperties}
});
