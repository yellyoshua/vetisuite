import {pkit} from '../pkit.config.js';

const appointmentsCount = pkit.module('appointments-count').name('general');

appointmentsCount.role('owner').registerActions({
  find: {enabled: true, properties: ['search', 'date', 'status', 'vet', 'patient']}
});

appointmentsCount.role('employee').registerActions({
  find: {enabled: true, properties: ['search', 'date', 'status', 'vet', 'patient']}
});
