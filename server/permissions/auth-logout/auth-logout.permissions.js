import {pkit} from '../pkit.config.js';

const logout = pkit.module('auth-logout').name('general');

logout.role('superadmin').registerActions({
  create: {enabled: true, properties: []}
});

logout.role('owner').registerActions({
  create: {enabled: true, properties: []}
});

logout.role('employee').registerActions({
  create: {enabled: true, properties: []}
});
