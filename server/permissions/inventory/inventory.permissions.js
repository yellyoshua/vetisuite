import {pkit} from '../pkit.config.js';

const productColumns = ['id', 'name', 'category', 'stock', 'minStock', 'price', 'expiry', 'createdAt', 'updatedAt'];

const inventory = pkit.module('inventory').name('general');

inventory.role('owner').registerActions({
  find: {enabled: true, properties: [...productColumns, 'search', 'status']}
});

inventory.role('employee').registerActions({
  find: {enabled: true, properties: [...productColumns, 'search', 'status']}
});
