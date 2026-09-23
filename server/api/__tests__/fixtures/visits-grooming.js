import {visitsServiceGroomingTable} from '@vetisuite/database/schemas/schemas.js';

export const table = visitsServiceGroomingTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {
    id: 'dd2e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    visitService: 'cc2e8400-e29b-41d4-a716-446655440002',
    groomer: '772e8400-e29b-41d4-a716-446655440003',
    belongings: 'Collar rojo',
    startedAt: new Date('2026-01-02T10:15:00.000Z'),
    createdAt: new Date('2026-01-02T10:00:00.000Z')
  },
  {
    id: 'dd2e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    visitService: 'cc2e8400-e29b-41d4-a716-446655440001',
    groomer: null,
    belongings: '',
    createdAt: new Date('2026-01-03T10:00:00.000Z')
  },
  {
    id: 'dd2e8400-e29b-41d4-a716-446655440003',
    organization: SOUTH,
    visitService: 'cc2e8400-e29b-41d4-a716-446655440003',
    groomer: '772e8400-e29b-41d4-a716-446655440005',
    belongings: 'Correa azul',
    createdAt: new Date('2026-01-01T09:00:00.000Z')
  }
];

export default rows;
