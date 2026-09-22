import {errorResponse} from '@/core/error-response.js';

export default function nitroErrorHandler (error, event) {
  if (event.handled) {
    return;
  }

  return errorResponse(error, {event, tag: '[nitro]'});
}
