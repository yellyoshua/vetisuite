import {pkit} from '../pkit.config.js';

const visitProperties = ['id', 'page', 'limit', 'search', 'order', 'type', 'status', 'staff'];

const visits = pkit.module('visits').name('general');

visits.role('owner').registerActions({
  find: {enabled: true, properties: visitProperties}
});

visits.role('employee').registerActions({
  find: {enabled: true, properties: visitProperties}
});
