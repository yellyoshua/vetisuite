import {pkit} from '../pkit.config.js';

const clinicProperties = ['id', 'page', 'limit', 'search', 'order', 'kind', 'status', 'preset'];

const clinic = pkit.module('clinic').name('general');

clinic.role('owner').registerActions({
  find: {enabled: true, properties: clinicProperties}
});

clinic.role('employee').registerActions({
  find: {enabled: true, properties: clinicProperties}
});
