import {whatsappTemplatesTable} from '@vetisuite/database/schemas/schemas.js';

export const table = whatsappTemplatesTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {id: 'bb2e8400-e29b-41d4-a716-446655440001', organization: NORTH, name: 'appointment_reminder', language: 'es', metaId: 'tpl-1', category: 'utility', status: 'approved'},
  {id: 'bb2e8400-e29b-41d4-a716-446655440002', organization: NORTH, name: 'vaccine_due_reminder', language: 'es', metaId: 'tpl-2', category: 'marketing', status: 'approved'},
  {id: 'bb2e8400-e29b-41d4-a716-446655440003', organization: SOUTH, name: 'appointment_reminder', language: 'es', metaId: 'tpl-3', category: 'utility', status: 'approved'}
];

export default rows;
