import {pkit} from '../pkit.config.js';

const clientsCount = pkit.module('clients-count').name('general');

clientsCount.role('owner').registerActions({
  find: {enabled: true, properties: ['search']}
});

clientsCount.role('employee').registerActions({
  find: {enabled: true, properties: ['search']}
});
