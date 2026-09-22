import {pkit} from '../pkit.config.js';

pkit.module('owners').name('general').role('superadmin').registerActions({
  find: {enabled: true, properties: ['id', 'avatar', 'firstName', 'lastName', 'phone', 'description', 'position', 'occupation', 'organization', 'createdAt', 'updatedAt', 'user', 'search']},
  create: {enabled: true, properties: ['organization', 'firstName', 'lastName', 'email', 'password', 'phone']},
  update: {enabled: true, properties: ['id', 'firstName', 'lastName', 'phone', 'description', 'position', 'occupation']}
});
