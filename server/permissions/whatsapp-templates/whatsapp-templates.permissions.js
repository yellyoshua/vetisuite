import {pkit} from '../pkit.config.js';

const queryProperties = ['search', 'order', 'page', 'limit'];

const whatsappTemplates = pkit.module('whatsapp-templates').name('general');

whatsappTemplates.role('owner').registerActions({
  find: {enabled: true, properties: queryProperties},
  create: {enabled: true, properties: []}
});

whatsappTemplates.role('employee').registerActions({
  find: {enabled: true, properties: queryProperties},
  create: {enabled: true, properties: []}
});
