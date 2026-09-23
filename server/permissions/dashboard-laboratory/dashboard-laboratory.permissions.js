import {pkit} from '../pkit.config.js';

const dashboardLaboratory = pkit.module('dashboard-laboratory').name('general');

dashboardLaboratory.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

dashboardLaboratory.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
