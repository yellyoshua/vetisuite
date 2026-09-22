import {beforeEach, describe, expect, it, vi} from 'vitest';
import storage from '@/utils/storage.js';
import uploadsPost from '@/api/uploads.post.js';
import filesGet, {isValidPath} from '@/api/files/[...path].get.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {EMPLOYEE} from './helpers/profiles.js';

vi.mock('@/utils/storage.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    default: {
      ...actual.default,
      signUpload: vi.fn(async (filePath) => ({url: 'https://s3.test/bucket', fields: {key: `temporal/${filePath}`}, key: `temporal/${filePath}`})),
      getDownloadUrl: vi.fn(async (filePath) => `https://s3.test/${filePath}?firma=1`)
    }
  };
});

describe('POST /api/uploads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('firma una key armada por el servidor con el id del usuario', async () => {
    const {response} = await uploadsPost(buildAuthedEvent({method: 'POST', body: {name: 'Mi Foto!!.PNG', size: 2048, type: 'image/png'}, profile: EMPLOYEE}));

    expect(response.path).toMatch(new RegExp(`^temporal/${EMPLOYEE.user.id}/[0-9a-f-]{36}\\.mi_foto\\.png$`));
    expect(response.url).toBe('https://s3.test/bucket');
    expect(storage.signUpload).toHaveBeenCalledWith(expect.any(String), 10485760, 300);
  });

  it('rechaza extensiones fuera del catálogo y tamaños mayores a 10 MB', async () => {
    const extension = buildAuthedEvent({method: 'POST', body: {name: 'virus.exe', size: 10}, profile: EMPLOYEE});
    const size = buildAuthedEvent({method: 'POST', body: {name: 'foto.png', size: 10485761}, profile: EMPLOYEE});

    await uploadsPost(extension);
    await uploadsPost(size);

    expect(responseBody(extension).fields).toEqual(['name']);
    expect(responseBody(size).fields).toEqual(['size']);
    expect(storage.signUpload).not.toHaveBeenCalled();
  });

  it('una clave no declarada responde 400', async () => {
    const event = buildAuthedEvent({method: 'POST', body: {name: 'foto.png', size: 10, key: 'images/ajena.png'}, profile: EMPLOYEE});

    await uploadsPost(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});

describe('GET /api/files/**', () => {
  it('redirige a la URL prefirmada de una carpeta permitida', async () => {
    const event = buildAuthedEvent({url: '/api/files/images/u1/a.png', profile: EMPLOYEE});

    event.context.params = {path: 'images/u1/a.png'};
    await filesGet(event);

    expect(event.node.res.statusCode).toBe(302);
    expect(event.node.res.getHeader('location')).toBe('https://s3.test/images/u1/a.png?firma=1');
    expect(event.node.res.getHeader('cache-control')).toBe('private, max-age=240');
  });

  it('rechaza rutas fuera de la allowlist', async () => {
    const event = buildAuthedEvent({url: '/api/files/temporal/u1/a.png', profile: EMPLOYEE});

    event.context.params = {path: 'temporal/u1/a.png'};

    await expect(filesGet(event)).rejects.toEqual({error: 'Ruta de archivo inválida', status: 400});
    expect(isValidPath('images/../x')).toBe(false);
  });
});
