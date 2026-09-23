import {pkit} from '../pkit.config.js';

const visitsCount = pkit.module('visits-count').name('general');

visitsCount.role('owner').registerActions({
  find: {enabled: true, properties: ['search', 'type', 'status', 'staff']}
});

visitsCount.role('employee').registerActions({
  find: {enabled: true, properties: ['search', 'type', 'status', 'staff']}
});
