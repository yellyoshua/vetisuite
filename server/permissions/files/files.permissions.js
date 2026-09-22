import {pkit} from '../pkit.config.js';

const files = pkit.module('files').name('general');

files.role('superadmin').registerActions({
  find: {enabled: true, properties: []}
});

files.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

files.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
