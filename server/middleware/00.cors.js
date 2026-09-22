import {defineEventHandler, getHeader, handleCors, isPreflightRequest, setHeader} from 'h3';
import {appDomain, landingDomain} from '@/utils/environment.js';

const allowedOrigins = [appDomain, landingDomain].filter(Boolean);

export default defineEventHandler((event) => {
  if (isPreflightRequest(event)) {
    setHeader(event, 'Access-Control-Max-Age', '86400');
  }

  handleCors(event, {
    origin: allowedOrigins,
    credentials: getHeader(event, 'origin') === appDomain,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type']
  });
});
