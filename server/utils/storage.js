import path from 'node:path';
import fsPromises from 'node:fs/promises';
import {Storage} from '@google-cloud/storage';
import {isLocal} from './environment.js';

// Copia server-local del storage de shared: la capa de archivos de base-route no depende de shared.

const credentials = process.env.GCP_SERVICE_ACCOUNT
  ? JSON.parse(process.env.GCP_SERVICE_ACCOUNT.replace(/\n/g, '\\n'))
  : undefined;

const gcpStorage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: credentials
});

const bucket = gcpStorage.bucket('linguakids-bucket');
// Monorepo: client/ y server/ corren con cwd en su subcarpeta; el bucket/ vive en la raíz
const BUCKET_DIR = path.resolve(process.cwd(), '../bucket');

const storage = {
  async upload (buffer, filePath, mimeType) {
    const destinationPath = path.join('temporal', filePath);

    if (isLocal) {
      const destinationFilePath = path.join(BUCKET_DIR, destinationPath);

      await fsPromises.mkdir(path.dirname(destinationFilePath), {recursive: true});
      await fsPromises.writeFile(destinationFilePath, buffer, {encoding: 'utf-8'});

      return destinationPath;
    }

    const file = bucket.file(destinationPath);

    await file.save(buffer, {metadata: {contentType: mimeType}, resumable: false});

    return destinationPath;
  },
  async move (sourceFilePath, destinationFilePath) {
    if (isLocal) {
      const destinationPath = path.join(BUCKET_DIR, destinationFilePath);
      const originPath = path.join(BUCKET_DIR, sourceFilePath);

      await fsPromises.mkdir(path.dirname(destinationPath), {recursive: true});
      await fsPromises.copyFile(originPath, destinationPath);
      await fsPromises.unlink(originPath);

      return destinationFilePath;
    }

    const source = bucket.file(sourceFilePath);
    const [exists] = await source.exists();

    if (exists) {
      const destination = bucket.file(destinationFilePath);

      await source.copy(destination);
      await source.delete();
    }

    return destinationFilePath;
  },
  async getFileStreamContent (filePath) {
    if (isLocal) {
      const absolutePath = path.join(BUCKET_DIR, filePath);
      const buffer = await fsPromises.readFile(absolutePath);

      return {
        stream: buffer,
        mimeType: 'application/octet-stream',
        cacheControl: 'private, max-age=0, must-revalidate'
      };
    }

    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();

    return {
      stream: file.createReadStream(),
      mimeType: metadata.contentType,
      cacheControl: 'private, max-age=31536000, immutable'
    };
  }
};

export default storage;
