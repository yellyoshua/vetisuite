import {pkit} from '../pkit.config.js';

const financeProperties = ['period', 'from', 'to', 'comparison'];

const finance = pkit.module('finance').name('general');

finance.role('owner').registerActions({
  find: {enabled: true, properties: financeProperties}
});

finance.role('employee').registerActions({
  find: {enabled: true, properties: financeProperties}
});
