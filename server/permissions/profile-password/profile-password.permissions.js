import {pkit} from '../pkit.config.js';

const passwordFields = ['currentPassword', 'password', 'confirmPassword'];

const profilePassword = pkit.module('profile-password').name('general');

profilePassword.role('superadmin').registerActions({
  update: {enabled: true, properties: passwordFields}
});

profilePassword.role('owner').registerActions({
  update: {enabled: true, properties: passwordFields}
});

profilePassword.role('employee').registerActions({
  update: {enabled: true, properties: passwordFields}
});
