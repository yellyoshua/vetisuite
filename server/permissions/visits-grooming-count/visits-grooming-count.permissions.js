import {pkit} from '../pkit.config.js';

const visitsGroomingCount = pkit.module('visits-grooming-count').name('general');

visitsGroomingCount.role('owner').registerActions({
  find: {enabled: true, properties: ['search', 'status', 'preset']}
});

visitsGroomingCount.role('employee').registerActions({
  find: {enabled: true, properties: ['search', 'status', 'preset']}
});
