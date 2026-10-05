import {pkit} from '../pkit.config.js';

const whatsappAnalytics = pkit.module('whatsapp-analytics').name('general');

whatsappAnalytics.role('owner').registerActions({
  find: {enabled: true, properties: ['days']}
});

whatsappAnalytics.role('employee').registerActions({
  find: {enabled: true, properties: ['days']}
});
