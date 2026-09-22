import {beforeEach, describe, expect, it, vi} from 'vitest';
import storage from '@/utils/storage.js';
import filesManager from '@/utils/files-manager.js';

vi.mock('@/utils/storage.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {...actual, default: {...actual.default, move: vi.fn(async (_source, destination) => destination)}};
});

describe('utils/files-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sin campos de archivo devuelve los datos tal cual', () => {
    const data = {name: 'x'};

    expect(filesManager().process(data)).toEqual({snapshot: data, fileMoves: []});
  });

  it('reescribe la key temporal a la carpeta final sin mutar los datos', () => {
    const data = {avatar: 'temporal/u1/a.png', name: 'x'};
    const {snapshot, fileMoves} = filesManager({avatar: {folder: 'images', type: 'photo'}}).process(data);

    expect(snapshot.avatar).toBe('images/u1/a.png');
    expect(data.avatar).toBe('temporal/u1/a.png');
    expect(fileMoves).toEqual([{source: 'temporal/u1/a.png', destination: 'images/u1/a.png'}]);
  });

  it('deja como están los valores que no son temporales', () => {
    const {snapshot, fileMoves} = filesManager({avatar: {folder: 'images'}}).process({avatar: 'images/u1/actual.png'});

    expect(snapshot.avatar).toBe('images/u1/actual.png');
    expect(fileMoves).toEqual([]);
  });

  it('rechaza una key que sale de la carpeta', () => {
    const manager = filesManager({avatar: {folder: 'images'}});

    expect(() => manager.process({avatar: 'temporal/../../etc/passwd'})).toThrow();

    try {
      manager.process({avatar: 'temporal/../../etc/passwd'});
    } catch (error) {
      expect(error).toEqual({error: 'Ruta de archivo inválida', status: 400});
    }
  });

  it('load mueve cada archivo en S3', async () => {
    await filesManager({avatar: {folder: 'images'}}).load([{source: 'temporal/u1/a.png', destination: 'images/u1/a.png'}]);

    expect(storage.move).toHaveBeenCalledWith('temporal/u1/a.png', 'images/u1/a.png');
  });
});
