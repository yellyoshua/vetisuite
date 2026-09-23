import {portalsSubmissionTable} from '@vetisuite/database/schemas/schemas.js';

export const table = portalsSubmissionTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const PORTAL_1 = 'bb2e8400-e29b-41d4-a716-446655440001';
const PORTAL_2 = 'bb2e8400-e29b-41d4-a716-446655440002';

const rows = [
  {
    id: 'cc2e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    portal: PORTAL_1,
    idempotencyKey: 'idem-1',
    status: 'appointment_created',
    createdAt: new Date('2026-01-03T01:00:00.000Z')
  },
  {
    id: 'cc2e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    portal: PORTAL_1,
    idempotencyKey: 'idem-2',
    status: 'appointment_created',
    createdAt: new Date('2026-01-03T02:00:00.000Z')
  },
  {
    id: 'cc2e8400-e29b-41d4-a716-446655440003',
    organization: NORTH,
    portal: PORTAL_1,
    idempotencyKey: 'idem-3',
    status: 'received',
    createdAt: new Date('2026-01-03T03:00:00.000Z')
  },
  {
    id: 'cc2e8400-e29b-41d4-a716-446655440004',
    organization: NORTH,
    portal: PORTAL_1,
    idempotencyKey: 'idem-4',
    status: 'appointment_created',
    createdAt: new Date('2026-01-03T04:00:00.000Z'),
    archivedAt: new Date('2026-01-04T00:00:00.000Z')
  },
  {
    id: 'cc2e8400-e29b-41d4-a716-446655440005',
    organization: NORTH,
    portal: PORTAL_2,
    idempotencyKey: 'idem-5',
    status: 'captured',
    createdAt: new Date('2026-01-03T05:00:00.000Z')
  }
];

export default rows;
