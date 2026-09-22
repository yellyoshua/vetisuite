import {beforeEach, describe, expect, it, vi} from 'vitest';

const sent = vi.hoisted(() => []);

vi.mock('@aws-sdk/client-s3', () => {
  class Command {
    constructor (input) {
      this.input = input;
    }
  }

  return {
    S3Client: class {
      send (command) {
        sent.push(command);

        return Promise.resolve({});
      }
    },
    CopyObjectCommand: class CopyObjectCommand extends Command {},
    DeleteObjectCommand: class DeleteObjectCommand extends Command {},
    GetObjectCommand: class GetObjectCommand extends Command {}
  };
});

vi.mock('@aws-sdk/s3-presigned-post', () => ({
  createPresignedPost: vi.fn(async (_client, params) => ({url: 'https://s3.test/bucket', fields: {key: params.Key}, params}))
}));

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(async (_client, command, options) => `https://s3.test/${command.input.Key}?ttl=${options.expiresIn}&disposition=${command.input.ResponseContentDisposition}`)
}));

const {default: storage} = await import('@/utils/storage.js');
const {createPresignedPost} = await import('@aws-sdk/s3-presigned-post');

describe('utils/storage', () => {
  beforeEach(() => {
    sent.length = 0;
  });

  it('firma un POST bajo temporal/ con rango de tamaño y key fija', async () => {
    const signed = await storage.signUpload('u1/uuid.foto.png', 100, 300);
    const [, params] = createPresignedPost.mock.calls[0];

    expect(signed.key).toBe('temporal/u1/uuid.foto.png');
    expect(params.Bucket).toBe('vetisuite-development-storage');
    expect(params.Conditions).toEqual([['content-length-range', 0, 100], ['eq', '$key', 'temporal/u1/uuid.foto.png']]);
    expect(params.Expires).toBe(300);
  });

  it('mueve copiando con la fuente codificada y borrando el original', async () => {
    const destination = await storage.move('temporal/u1/a b.png', 'images/u1/a b.png');

    expect(destination).toBe('images/u1/a b.png');
    expect(sent[0].constructor.name).toBe('CopyObjectCommand');
    expect(sent[0].input.CopySource).toBe('vetisuite-development-storage/temporal/u1/a%20b.png');
    expect(sent[1].constructor.name).toBe('DeleteObjectCommand');
    expect(sent[1].input.Key).toBe('temporal/u1/a b.png');
  });

  it('las imágenes se sirven inline y el resto como adjunto', async () => {
    const image = await storage.getDownloadUrl('images/u1/a.png');
    const document = await storage.getDownloadUrl('images/u1/a.pdf');

    expect(image).toContain('disposition=inline');
    expect(image).toContain('ttl=300');
    expect(document).toContain('disposition=attachment');
  });

  it('isTemporal solo acepta strings bajo temporal/', () => {
    expect(storage.isTemporal('temporal/u1/a.png')).toBe(true);
    expect(storage.isTemporal('images/u1/a.png')).toBe(false);
    expect(storage.isTemporal(null)).toBe(false);
  });
});
