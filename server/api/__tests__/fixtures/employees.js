import {employeesTable} from '@vetisuite/database/schemas/schemas.js';

export const table = employeesTable;

const rows = [
  {id: '772e8400-e29b-41d4-a716-446655440003', organization: '552e8400-e29b-41d4-a716-446655440001', user: '662e8400-e29b-41d4-a716-446655440003', firstName: 'Marta', lastName: 'Díaz', position: 'veterinarian'},
  {id: '772e8400-e29b-41d4-a716-446655440005', organization: '552e8400-e29b-41d4-a716-446655440002', user: '662e8400-e29b-41d4-a716-446655440005', firstName: 'Pedro', lastName: 'Ruiz', position: 'groomer'},
  {id: '772e8400-e29b-41d4-a716-446655440007', organization: '552e8400-e29b-41d4-a716-446655440001', user: '662e8400-e29b-41d4-a716-446655440007', firstName: 'Iván', lastName: 'Soto', position: 'receptionist'}
];

export default rows;
