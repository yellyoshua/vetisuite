import {pkit} from '../pkit.config.js';

pkit.module('organizations').name('general').role('superadmin').registerActions({
  find: {enabled: true, properties: ['id', 'name', 'slug', 'createdAt', 'search']}
});
