import {randomUUID} from 'node:crypto';
import slugify from 'slugify';
import storage from '@/utils/storage.js';
import {canonicalExtension} from '@/utils/file-checker.js';
import {MAX_FILE_SIZE} from './uploads.schema.js';

const SIGNATURE_SECONDS = 300;

export async function signUpload (fileName, profile) {
  const extension = canonicalExtension(fileName);

  if (!extension) {
    throw {error: 'Tipo de archivo no permitido', status: 400};
  }

  const {url, fields, key} = await storage.signUpload(
    buildKey(fileName, extension, profile.user.id),
    MAX_FILE_SIZE,
    SIGNATURE_SECONDS
  );

  return {
    url,
    fields,
    path: key,
    expiresAt: new Date(Date.now() + (SIGNATURE_SECONDS * 1000)).toISOString()
  };
}

function buildKey (fileName, extension, userId) {
  const baseName = fileName.slice(0, fileName.lastIndexOf('.'));
  const slug = slugify(baseName, {lower: true, strict: true, trim: true, replacement: '_'}) || 'archivo';

  return `${userId}/${randomUUID()}.${slug}.${extension}`;
}
