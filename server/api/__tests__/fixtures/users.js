import {usersTable} from '@vetisuite/database/schemas/schemas.js';
import {TEST_PASSWORD_HASH} from '@/tests/constants.js';

export const table = usersTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';
const PLATFORM = '552e8400-e29b-41d4-a716-446655440003';

const rows = [
  {id: '662e8400-e29b-41d4-a716-446655440001', organization: NORTH, email: 'api.owner@test.com', password: TEST_PASSWORD_HASH, role: 'owner', emailConfirmed: true},
  {id: '662e8400-e29b-41d4-a716-446655440002', organization: SOUTH, email: 'api.owner.two@test.com', password: TEST_PASSWORD_HASH, role: 'owner', emailConfirmed: true},
  {id: '662e8400-e29b-41d4-a716-446655440003', organization: NORTH, email: 'api.employee@test.com', password: TEST_PASSWORD_HASH, role: 'employee', emailConfirmed: false},
  {id: '662e8400-e29b-41d4-a716-446655440004', organization: PLATFORM, email: 'api.superadmin@test.com', password: TEST_PASSWORD_HASH, role: 'superadmin', emailConfirmed: true},
  {id: '662e8400-e29b-41d4-a716-446655440005', organization: SOUTH, email: 'api.employee.two@test.com', password: TEST_PASSWORD_HASH, role: 'employee', emailConfirmed: true},
  {id: '662e8400-e29b-41d4-a716-446655440006', organization: PLATFORM, email: 'api.superadmin.two@test.com', password: TEST_PASSWORD_HASH, role: 'superadmin', emailConfirmed: true},
  {id: '662e8400-e29b-41d4-a716-446655440007', organization: NORTH, email: 'api.employee.disabled@test.com', password: TEST_PASSWORD_HASH, role: 'employee', emailConfirmed: true, disabled: true}
];

export default rows;
