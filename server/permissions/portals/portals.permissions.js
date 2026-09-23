import {pkit} from '../pkit.config.js';

const portalColumns = ['id', 'name', 'slug', 'purpose', 'campaignName', 'status', 'createdAt', 'updatedAt'];
const queryProperties = ['search', 'order', 'page', 'limit', 'preset'];

const portals = pkit.module('portals').name('general');

portals.role('owner').registerActions({
  find: {enabled: true, properties: [...portalColumns, ...queryProperties]}
});

portals.role('employee').registerActions({
  find: {enabled: true, properties: [...portalColumns, ...queryProperties]}
});
