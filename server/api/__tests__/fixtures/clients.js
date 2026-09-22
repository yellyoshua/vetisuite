import {clientsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = clientsTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {id: '992e8400-e29b-41d4-a716-446655440001', organization: NORTH, name: 'Carla Méndez', phone: '5551001', email: 'carla@correo.test', createdAt: new Date('2026-01-03T00:00:00.000Z')},
  {id: '992e8400-e29b-41d4-a716-446655440002', organization: NORTH, name: 'Jorge Lara', phone: '5551002', createdAt: new Date('2026-01-02T00:00:00.000Z')},
  {id: '992e8400-e29b-41d4-a716-446655440003', organization: SOUTH, name: 'Ajena Sur', phone: '5552001'},
  {id: '992e8400-e29b-41d4-a716-446655440004', organization: NORTH, name: 'Archivada Norte', phone: '5551003', archivedAt: new Date('2026-01-01T00:00:00.000Z')}
];

export default rows;
