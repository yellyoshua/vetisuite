import {sessionsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = sessionsTable;

export const TEST_USER_AGENT = 'vitest-agent';

const FAR_FUTURE = new Date('2099-01-01T00:00:00.000Z');

const rows = [
  {id: '882e8400-e29b-41d4-a716-446655440001', user: '662e8400-e29b-41d4-a716-446655440001', ip: '203.0.113.5', userAgent: TEST_USER_AGENT, expiresAt: FAR_FUTURE, createdAt: new Date('2026-01-02T00:00:00.000Z')},
  {id: '882e8400-e29b-41d4-a716-446655440002', user: '662e8400-e29b-41d4-a716-446655440001', ip: '203.0.113.5', userAgent: TEST_USER_AGENT, expiresAt: new Date('2020-01-01T00:00:00.000Z')},
  {id: '882e8400-e29b-41d4-a716-446655440003', user: '662e8400-e29b-41d4-a716-446655440007', ip: '203.0.113.5', userAgent: TEST_USER_AGENT, expiresAt: FAR_FUTURE},
  {id: '882e8400-e29b-41d4-a716-446655440004', user: '662e8400-e29b-41d4-a716-446655440001', ip: '203.0.113.9', userAgent: 'other-agent', expiresAt: FAR_FUTURE, createdAt: new Date('2026-01-01T00:00:00.000Z')},
  {id: '882e8400-e29b-41d4-a716-446655440005', user: '662e8400-e29b-41d4-a716-446655440002', ip: '203.0.113.7', userAgent: TEST_USER_AGENT, expiresAt: FAR_FUTURE}
];

export default rows;
