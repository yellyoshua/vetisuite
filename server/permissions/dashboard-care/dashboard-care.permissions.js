import {pkit} from '../pkit.config.js';

const dashboardCare = pkit.module('dashboard-care').name('general');

dashboardCare.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

dashboardCare.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
