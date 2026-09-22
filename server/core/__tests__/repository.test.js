import {beforeEach, describe, expect, it} from 'vitest';
import repository from '@/core/repository.js';
import {clientsTable, employeesTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import {ACCOUNT_FIXTURES} from '@/api/__tests__/helpers/profiles.js';

const FIXTURES = [...ACCOUNT_FIXTURES, 'api/__tests__/fixtures/clients.js'];

const employeesRepository = repository(employeesTable, {relations: {user: usersTable}});
const clientsRepository = repository(clientsTable);
const usersRepository = repository(usersTable);

const NORTH = '552e8400-e29b-41d4-a716-446655440001';

describe('core/repository', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('devuelve filas sin envelope y nunca password', async () => {
    const users = await usersRepository.find({}, {limit: -1});

    expect(Array.isArray(users)).toBe(true);
    expect(users).toHaveLength(7);
    expect(users.every((user) => user.password === undefined)).toBe(true);
  });

  it('redacta password también dentro de un join completo', async () => {
    const [employee] = await employeesRepository.find({id: '772e8400-e29b-41d4-a716-446655440003'}, {join: {user: true}});

    expect(employee.user.email).toBe('api.employee@test.com');
    expect(employee.user.password).toBeUndefined();
  });

  it('proyecta con select y con join por string', async () => {
    const employee = await employeesRepository.findOne({id: '772e8400-e29b-41d4-a716-446655440003'}, {
      select: {firstName: true},
      join: {user: 'email role'}
    });

    expect(employee).toEqual({firstName: 'Marta', user: {email: 'api.employee@test.com', role: 'employee'}});
  });

  it('un join sin relación o sin columnas válidas deja la FK plana', async () => {
    const unknownRelation = await clientsRepository.findOne({id: '992e8400-e29b-41d4-a716-446655440001'}, {join: {organization: true}});
    const emptyColumns = await employeesRepository.findOne({id: '772e8400-e29b-41d4-a716-446655440003'}, {join: {user: 'inexistente'}});

    expect(unknownRelation.organization).toBe(NORTH);
    expect(emptyColumns.user).toBe('662e8400-e29b-41d4-a716-446655440003');
  });

  it('sin resultados devuelve [] y null', async () => {
    const none = await clientsRepository.find({name: 'nadie'});
    const missing = await clientsRepository.findOne({id: '992e8400-e29b-41d4-a716-446655440099'});

    expect(none).toEqual([]);
    expect(missing).toBeNull();
  });

  it('un filtro null es IS NULL y las claves que no son columnas se ignoran', async () => {
    const active = await clientsRepository.find({organization: NORTH, archivedAt: null, noEsColumna: 'x'}, {limit: -1});

    expect(active.map((client) => client.name).sort()).toEqual(['Carla Méndez', 'Jorge Lara']);
  });

  it('busca con tokens escapados, ordena y pagina', async () => {
    const searched = await clientsRepository.find({organization: NORTH}, {search: 'carla%', searchFields: ['name']});
    const firstPage = await clientsRepository.find({organization: NORTH}, {orderBy: {name: 'asc'}, limit: 2, page: 1});
    const secondPage = await clientsRepository.find({organization: NORTH}, {orderBy: {name: 'asc'}, limit: 2, page: 2});

    expect(searched).toEqual([]);
    expect(firstPage.map((client) => client.name)).toEqual(['Archivada Norte', 'Carla Méndez']);
    expect(secondPage.map((client) => client.name)).toEqual(['Jorge Lara']);
  });

  it('count devuelve un número y respeta la búsqueda', async () => {
    const total = await clientsRepository.count({organization: NORTH});
    const searched = await clientsRepository.count({organization: NORTH}, {search: 'lara', searchFields: ['name']});

    expect(total).toBe(3);
    expect(searched).toBe(1);
  });

  it('un fallo de la base se traduce a {error, status: 500}', async () => {
    await expect(clientsRepository.find({id: 'no-es-uuid'})).rejects.toEqual({error: 'No se pudo consultar la información', status: 500});
  });

  it('una selección de columnas no soportada falla', async () => {
    await expect(clientsRepository.find({}, {select: 42})).rejects.toEqual({error: 'No se pudo consultar la información', status: 500});
  });
});
