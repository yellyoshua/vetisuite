import {pkit} from '../pkit.config.js';

const emailVerification = pkit.module('profile-email-verification').name('general');

emailVerification.role('superadmin').registerActions({
  create: {enabled: true, properties: []}
});

emailVerification.role('owner').registerActions({
  create: {enabled: true, properties: []}
});

emailVerification.role('employee').registerActions({
  create: {enabled: true, properties: []}
});
