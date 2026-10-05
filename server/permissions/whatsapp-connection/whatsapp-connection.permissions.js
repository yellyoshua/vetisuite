import {pkit} from '../pkit.config.js';

const connectionFields = ['code', 'wabaId', 'phoneNumberId', 'consentAccepted'];

const whatsappConnection = pkit.module('whatsapp-connection').name('general');

whatsappConnection.role('owner').registerActions({
  create: {enabled: true, properties: connectionFields},
  remove: {enabled: true, properties: []}
});

whatsappConnection.role('employee').registerActions({
  create: {enabled: true, properties: connectionFields},
  remove: {enabled: true, properties: []}
});
