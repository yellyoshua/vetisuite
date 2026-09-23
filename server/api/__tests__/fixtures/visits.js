import {visitsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = visitsTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {id: 'bb2e8400-e29b-41d4-a716-446655440001', organization: NORTH, client: '992e8400-e29b-41d4-a716-446655440001', started: false, createdAt: new Date('2026-01-03T10:00:00.000Z')},
  {id: 'bb2e8400-e29b-41d4-a716-446655440002', organization: NORTH, client: '992e8400-e29b-41d4-a716-446655440002', started: true, createdAt: new Date('2026-01-02T10:00:00.000Z')},
  {id: 'bb2e8400-e29b-41d4-a716-446655440003', organization: SOUTH, client: '992e8400-e29b-41d4-a716-446655440003', started: false, createdAt: new Date('2026-01-01T10:00:00.000Z')},
  {id: 'bb2e8400-e29b-41d4-a716-446655440004', organization: NORTH, client: '992e8400-e29b-41d4-a716-446655440004', started: false, archivedAt: new Date('2026-01-01T00:00:00.000Z')}
];

export default rows;
