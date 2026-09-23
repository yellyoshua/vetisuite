import {pkit} from '../pkit.config.js';

const inventoryCount = pkit.module('inventory-count').name('general');

inventoryCount.role('owner').registerActions({
  find: {enabled: true, properties: ['search', 'category', 'status']}
});

inventoryCount.role('employee').registerActions({
  find: {enabled: true, properties: ['search', 'category', 'status']}
});
