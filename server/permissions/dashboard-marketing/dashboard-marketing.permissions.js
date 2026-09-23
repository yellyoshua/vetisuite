import {pkit} from '../pkit.config.js';

const dashboardMarketing = pkit.module('dashboard-marketing').name('general');

dashboardMarketing.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

dashboardMarketing.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
