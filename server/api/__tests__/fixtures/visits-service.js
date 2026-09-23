import {visitsServiceTable} from '@vetisuite/database/schemas/schemas.js';

export const table = visitsServiceTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {id: 'cc2e8400-e29b-41d4-a716-446655440001', organization: NORTH, visit: 'bb2e8400-e29b-41d4-a716-446655440001', patient: 'aa2e8400-e29b-41d4-a716-446655440001', type: 'veterinary', label: 'Consulta general', price: 25, status: 'pending', started: false},
  {id: 'cc2e8400-e29b-41d4-a716-446655440002', organization: NORTH, visit: 'bb2e8400-e29b-41d4-a716-446655440002', patient: 'aa2e8400-e29b-41d4-a716-446655440002', type: 'grooming', label: 'Baño completo', price: 18, status: 'in_progress', started: true},
  {id: 'cc2e8400-e29b-41d4-a716-446655440003', organization: SOUTH, visit: 'bb2e8400-e29b-41d4-a716-446655440003', patient: 'aa2e8400-e29b-41d4-a716-446655440003', type: 'laboratory', label: 'Hemograma completo', price: 30, status: 'pending', started: false}
];

export default rows;
