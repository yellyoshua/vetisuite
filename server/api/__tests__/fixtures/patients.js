import {patientsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = patientsTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {id: 'aa2e8400-e29b-41d4-a716-446655440001', organization: NORTH, client: '992e8400-e29b-41d4-a716-446655440001', name: 'Firulais', species: 'dog', breed: 'Mestizo', sex: 'male', birthDate: '2020-05-01'},
  {id: 'aa2e8400-e29b-41d4-a716-446655440002', organization: NORTH, client: '992e8400-e29b-41d4-a716-446655440002', name: 'Michi', species: 'cat'},
  {id: 'aa2e8400-e29b-41d4-a716-446655440003', organization: SOUTH, client: '992e8400-e29b-41d4-a716-446655440003', name: 'Ajeno', species: 'bird'}
];

export default rows;
