import {pkit} from '../pkit.config.js';

const billingCountProperties = ['id', 'search', 'status', 'preset'];

const billingCount = pkit.module('billing-count').name('general');

billingCount.role('owner').registerActions({
  find: {enabled: true, properties: billingCountProperties}
});

billingCount.role('employee').registerActions({
  find: {enabled: true, properties: billingCountProperties}
});
