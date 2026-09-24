import {pkit} from '../pkit.config.js';

const organization = pkit.module('organization').name('general');

organization.role('owner').registerActions({
  find: {enabled: true, properties: ['id', 'name', 'timezone']},
  update: {enabled: true, properties: ['timezone']}
});

organization.role('employee').registerActions({
  find: {enabled: true, properties: ['id', 'name', 'timezone']},
  update: {enabled: true, properties: ['timezone']}
});
