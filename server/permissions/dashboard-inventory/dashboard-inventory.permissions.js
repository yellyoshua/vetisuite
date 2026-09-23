import {pkit} from '../pkit.config.js';

const dashboardInventory = pkit.module('dashboard-inventory').name('general');

dashboardInventory.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

dashboardInventory.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
