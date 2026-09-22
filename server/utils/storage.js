import path from 'node:path';
import {S3Client, CopyObjectCommand, DeleteObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import {createPresignedPost} from '@aws-sdk/s3-presigned-post';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {canonicalExtension} from './file-checker.js';

const s3 = new S3Client({
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED'
});

const BUCKET = process.env.STORAGE_BUCKET || `vetisuite-${process.env.APP_ENV}-storage`;

const CONTENT_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

const DOWNLOAD_URL_TTL_SECONDS = 300;

export const TEMPORAL_FOLDER = 'temporal';

const storage = {
  async signUpload (filePath, maxBytes, expiresInSeconds) {
    const destinationPath = path.join(TEMPORAL_FOLDER, filePath);

    const {url, fields} = await createPresignedPost(s3, {
      Bucket: BUCKET,
      Key: destinationPath,
      Expires: expiresInSeconds,
      Conditions: [
        ['content-length-range', 0, maxBytes],
        ['eq', '$key', destinationPath]
      ]
    });

    return {url, fields, key: destinationPath};
  },
  async move (sourceFilePath, destinationFilePath) {
    await s3.send(new CopyObjectCommand({
      Bucket: BUCKET,
      Key: destinationFilePath,
      CopySource: buildCopySource(BUCKET, sourceFilePath)
    }));

    await s3.send(new DeleteObjectCommand({Bucket: BUCKET, Key: sourceFilePath}));

    return destinationFilePath;
  },
  async getDownloadUrl (filePath) {
    const contentType = CONTENT_TYPES[canonicalExtension(filePath)] || 'application/octet-stream';

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: filePath,
      ResponseContentType: contentType,
      ResponseContentDisposition: contentType.startsWith('image/') ? 'inline' : 'attachment'
    });

    return getSignedUrl(s3, command, {expiresIn: DOWNLOAD_URL_TTL_SECONDS});
  },
  isTemporal (filePath) {
    return typeof filePath === 'string' && filePath.startsWith(`${TEMPORAL_FOLDER}/`);
  }
};

export default storage;

function buildCopySource (bucket, key) {
  return `${bucket}/${key.split('/').map(encodeURIComponent).join('/')}`;
}
