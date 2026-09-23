import {pkit} from '../pkit.config.js';

const dashboardBilling = pkit.module('dashboard-billing').name('general');

dashboardBilling.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

dashboardBilling.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
