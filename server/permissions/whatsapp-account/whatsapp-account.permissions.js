import {pkit} from '../pkit.config.js';

const whatsappAccount = pkit.module('whatsapp-account').name('general');

whatsappAccount.role('owner').registerActions({
  find: {enabled: true, properties: []}
});

whatsappAccount.role('employee').registerActions({
  find: {enabled: true, properties: []}
});
