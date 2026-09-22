import {defineNitroPlugin} from 'nitropack/runtime';
import logger from '@/utils/logger.js';

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, {event}) => {
    if (event) {
      return;
    }

    logger.error('[nitro]', {error});
  });
});
