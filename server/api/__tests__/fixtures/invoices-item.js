import {invoicesItemTable} from '@vetisuite/database/schemas/schemas.js';

export const table = invoicesItemTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {
    id: '222e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    invoice: '112e8400-e29b-41d4-a716-446655440001',
    description: 'Consulta general',
    amount: 20,
    area: 'clinic',
    patient: 'aa2e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2026-01-05T10:00:00.000Z')
  },
  {
    id: '222e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    invoice: '112e8400-e29b-41d4-a716-446655440001',
    description: 'Vacuna antirrábica',
    amount: 10,
    area: 'clinic',
    patient: 'aa2e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2026-01-05T10:05:00.000Z')
  },
  {
    id: '222e8400-e29b-41d4-a716-446655440003',
    organization: NORTH,
    invoice: '112e8400-e29b-41d4-a716-446655440003',
    description: 'Baño y corte',
    amount: 40,
    area: 'grooming',
    patient: 'aa2e8400-e29b-41d4-a716-446655440001',
    createdAt: new Date('2026-01-07T10:00:00.000Z')
  },
  {
    id: '222e8400-e29b-41d4-a716-446655440004',
    organization: SOUTH,
    invoice: '112e8400-e29b-41d4-a716-446655440004',
    description: 'Examen de sangre',
    amount: 50,
    area: 'laboratory',
    patient: 'aa2e8400-e29b-41d4-a716-446655440003',
    createdAt: new Date('2026-01-08T10:00:00.000Z')
  }
];

export default rows;
