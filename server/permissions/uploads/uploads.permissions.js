import {pkit} from '../pkit.config.js';

const uploadFields = ['name', 'size', 'type'];

const uploads = pkit.module('uploads').name('general');

uploads.role('superadmin').registerActions({
  create: {enabled: true, properties: uploadFields}
});

uploads.role('owner').registerActions({
  create: {enabled: true, properties: uploadFields}
});

uploads.role('employee').registerActions({
  create: {enabled: true, properties: uploadFields}
});
