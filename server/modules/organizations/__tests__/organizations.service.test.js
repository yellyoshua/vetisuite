import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import {assertOrganizationExists, createOrganization} from '@/modules/organizations/organizations.service.js';

describe('modules/organizations', () => {
  beforeEach(async () => {
    await resetAndLoad(['api/__tests__/fixtures/organizations.js']);
  });

  it('arma el slug sin acentos ni símbolos', async () => {
    const organization = await createOrganization({name: '  Clínica Veterinaria Ñandú & Cía  '});

    expect(organization.slug).toBe('clinica-veterinaria-nandu-and-cia');
  });

  it('usa un slug de respaldo cuando el nombre no deja caracteres válidos', async () => {
    const organization = await createOrganization({name: '!!!'});

    expect(organization.slug).toBe('clinica');
  });

  it('un slug repetido es 409', async () => {
    await expect(createOrganization({name: 'Clínica Sur'})).rejects.toEqual({error: 'Ya existe una clínica registrada con ese nombre', status: 409});
  });

  it('assertOrganizationExists es 404 para un id desconocido', async () => {
    await expect(assertOrganizationExists('552e8400-e29b-41d4-a716-446655440099')).rejects.toEqual({error: 'Organización no encontrada', status: 404});
    await expect(assertOrganizationExists('552e8400-e29b-41d4-a716-446655440001')).resolves.toBeUndefined();
  });
});
