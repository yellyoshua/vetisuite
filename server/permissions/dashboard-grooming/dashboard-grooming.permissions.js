import {pkit} from '../pkit.config.js';

const dashboardGrooming = pkit.module('dashboard-grooming').name('general');

dashboardGrooming.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

dashboardGrooming.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
