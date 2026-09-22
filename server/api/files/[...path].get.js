import {defineEventHandler, getRouterParam, sendRedirect, setResponseHeaders} from 'h3';
import storage from '@/utils/storage.js';
import validators from '@/utils/validators.js';

const ALLOWED_FOLDERS = ['images'];

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path');

  if (!isValidPath(path)) {
    throw {error: 'Ruta de archivo inválida', status: 400};
  }

  setResponseHeaders(event, {'Cache-Control': 'private, max-age=240'});

  return sendRedirect(event, await storage.getDownloadUrl(path), 302);
});

export function isValidPath (path) {
  return validators.isSafePath(path, ALLOWED_FOLDERS);
}
