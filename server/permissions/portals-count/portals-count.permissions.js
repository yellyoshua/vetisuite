import {pkit} from '../pkit.config.js';

const portalsCount = pkit.module('portals-count').name('general');

portalsCount.role('owner').registerActions({
  find: {enabled: true, properties: ['id', 'search', 'purpose', 'status', 'preset']}
});

portalsCount.role('employee').registerActions({
  find: {enabled: true, properties: ['id', 'search', 'purpose', 'status', 'preset']}
});
