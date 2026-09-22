const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';
const PLATFORM = '552e8400-e29b-41d4-a716-446655440003';

export const OWNER = {id: '772e8400-e29b-41d4-a716-446655440001', organization: NORTH, avatar: null, user: {id: '662e8400-e29b-41d4-a716-446655440001', role: 'owner', email: 'api.owner@test.com', emailConfirmed: true}};
export const OTHER_OWNER = {id: '772e8400-e29b-41d4-a716-446655440002', organization: SOUTH, avatar: null, user: {id: '662e8400-e29b-41d4-a716-446655440002', role: 'owner', email: 'api.owner.two@test.com', emailConfirmed: true}};
export const EMPLOYEE = {id: '772e8400-e29b-41d4-a716-446655440003', organization: NORTH, avatar: null, user: {id: '662e8400-e29b-41d4-a716-446655440003', role: 'employee', email: 'api.employee@test.com', emailConfirmed: false}};
export const OTHER_EMPLOYEE = {id: '772e8400-e29b-41d4-a716-446655440005', organization: SOUTH, avatar: null, user: {id: '662e8400-e29b-41d4-a716-446655440005', role: 'employee', email: 'api.employee.two@test.com', emailConfirmed: true}};
export const SUPERADMIN = {id: '772e8400-e29b-41d4-a716-446655440004', organization: PLATFORM, avatar: null, user: {id: '662e8400-e29b-41d4-a716-446655440004', role: 'superadmin', email: 'api.superadmin@test.com', emailConfirmed: true}};
export const OTHER_SUPERADMIN_ID = '772e8400-e29b-41d4-a716-446655440006';
export const DISABLED_EMPLOYEE_ID = '772e8400-e29b-41d4-a716-446655440007';

export const ACCOUNT_FIXTURES = [
  'api/__tests__/fixtures/organizations.js',
  'api/__tests__/fixtures/users.js',
  'api/__tests__/fixtures/superadmins.js',
  'api/__tests__/fixtures/owners.js',
  'api/__tests__/fixtures/employees.js',
  'api/__tests__/fixtures/permissions.js'
];
