import {pkit} from '../pkit.config.js';

const dashboardReception = pkit.module('dashboard-reception').name('general');

dashboardReception.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

dashboardReception.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
