import {pkit} from '../pkit.config.js';

const billingProperties = ['id', 'page', 'limit', 'search', 'order', 'status', 'preset'];

const billing = pkit.module('billing').name('general');

billing.role('owner').registerActions({
  find: {enabled: true, properties: billingProperties}
});

billing.role('employee').registerActions({
  find: {enabled: true, properties: billingProperties}
});
