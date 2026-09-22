import {defineEventHandler} from 'h3';

const PUBLIC_PREFIXES = ['/api/public/', '/api/oauth/', '/api/webhooks/', '/api/healthcheck'];

export default defineEventHandler((event) => {
  const path = event.path.split('?')[0];

  event.context.isPublic = !path.startsWith('/api/') || PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix));
});
