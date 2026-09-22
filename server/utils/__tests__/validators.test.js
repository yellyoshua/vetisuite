import {describe, expect, it} from 'vitest';
import validators from '@/utils/validators.js';
import {canonicalExtension, isImageFile} from '@/utils/file-checker.js';

const USER = '662e8400-e29b-41d4-a716-446655440001';

describe('utils/validators', () => {
  it('isOwnFile acepta el valor actual o una key temporal del usuario', () => {
    expect(validators.isOwnFile('images/x.png', USER, 'images/x.png')).toBe(true);
    expect(validators.isOwnFile(`temporal/${USER}/a.foto.png`, USER)).toBe(true);
    expect(validators.isOwnFile('temporal/otro/a.foto.png', USER)).toBe(false);
    expect(validators.isOwnFile(`temporal/${USER}/../otro/a.png`, USER)).toBe(false);
    expect(validators.isOwnFile('images/ajena.png', USER, 'images/mia.png')).toBe(false);
  });

  it('isSafePath exige carpeta permitida, caracteres seguros y sin ..', () => {
    expect(validators.isSafePath('images/u/a.png', ['images'])).toBe(true);
    expect(validators.isSafePath('temporal/u/a.png', ['images'])).toBe(false);
    expect(validators.isSafePath('images/../secret', ['images'])).toBe(false);
    expect(validators.isSafePath('/images/a.png', ['images'])).toBe(false);
    expect(validators.isSafePath('images/a b.png', ['images'])).toBe(false);
    expect(validators.isSafePath('', ['images'])).toBe(false);
  });
});

describe('utils/file-checker', () => {
  it('canonicalExtension usa un catálogo cerrado', () => {
    expect(canonicalExtension('Foto.JPG')).toBe('jpg');
    expect(canonicalExtension('script.exe')).toBeNull();
    expect(canonicalExtension(undefined)).toBeNull();
  });

  it('reconoce imágenes por extensión o por tipo declarado', () => {
    expect(isImageFile('a.webp')).toBe(true);
    expect(isImageFile({name: 'sin-extension', type: 'image/png'})).toBe(true);
    expect(isImageFile('a.pdf')).toBe(false);
  });
});
