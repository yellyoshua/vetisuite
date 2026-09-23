import {appointmentsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = appointmentsTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    patient: 'aa2e8400-e29b-41d4-a716-446655440001',
    vet: '772e8400-e29b-41d4-a716-446655440003',
    startsAt: new Date('2026-09-22T09:00:00.000Z'),
    durationMinutes: 30,
    reason: 'Vacunación anual',
    status: 'confirmed',
    source: 'staff',
    createdAt: new Date('2026-09-20T00:00:00.000Z')
  },
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    patient: 'aa2e8400-e29b-41d4-a716-446655440002',
    vet: '772e8400-e29b-41d4-a716-446655440003',
    startsAt: new Date('2026-09-22T10:00:00.000Z'),
    durationMinutes: 45,
    reason: 'Control dermatológico',
    status: 'pending',
    source: 'staff',
    createdAt: new Date('2026-09-21T00:00:00.000Z')
  },
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440003',
    organization: SOUTH,
    patient: 'aa2e8400-e29b-41d4-a716-446655440003',
    vet: '772e8400-e29b-41d4-a716-446655440005',
    startsAt: new Date('2026-09-22T11:00:00.000Z'),
    durationMinutes: 30,
    reason: 'Chequeo general',
    status: 'confirmed',
    source: 'staff',
    createdAt: new Date('2026-09-21T00:00:00.000Z')
  },
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440004',
    organization: NORTH,
    patient: 'aa2e8400-e29b-41d4-a716-446655440001',
    vet: '772e8400-e29b-41d4-a716-446655440003',
    startsAt: new Date('2026-09-22T14:00:00.000Z'),
    durationMinutes: 30,
    reason: 'Cancelada archivada',
    status: 'cancelled',
    source: 'staff',
    createdAt: new Date('2026-09-19T00:00:00.000Z'),
    archivedAt: new Date('2026-09-20T00:00:00.000Z')
  },
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440005',
    organization: NORTH,
    patient: 'aa2e8400-e29b-41d4-a716-446655440001',
    vet: '772e8400-e29b-41d4-a716-446655440003',
    startsAt: new Date('2026-09-23T09:00:00.000Z'),
    durationMinutes: 30,
    reason: 'Control posterior',
    status: 'confirmed',
    source: 'staff',
    createdAt: new Date('2026-09-21T00:00:00.000Z')
  }
];

export default rows;
