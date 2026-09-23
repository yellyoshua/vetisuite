import {pkit} from '../pkit.config.js';

const dashboardAdministration = pkit.module('dashboard-administration').name('general');

dashboardAdministration.role('owner').registerActions({
  find: {enabled: true, properties: []}
});
