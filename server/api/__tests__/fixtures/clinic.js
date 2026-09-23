import {consultationsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = consultationsTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {
    id: 'ee2e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    patient: 'aa2e8400-e29b-41d4-a716-446655440001',
    vet: '772e8400-e29b-41d4-a716-446655440003',
    weightKg: 12.5,
    temperatureC: 38.5,
    heartRateBpm: 90,
    anamnesis: 'Chequeo de rutina',
    diagnosis: 'Consulta médica general',
    createdAt: new Date('2026-09-22T08:00:00Z')
  },
  {
    id: 'ee2e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    patient: 'aa2e8400-e29b-41d4-a716-446655440002',
    vet: '772e8400-e29b-41d4-a716-446655440003',
    weightKg: 4.2,
    temperatureC: 38.2,
    heartRateBpm: 120,
    anamnesis: 'Control post operatorio',
    diagnosis: 'Consulta de control',
    createdAt: new Date('2026-09-22T09:00:00Z')
  },
  {
    id: 'ee2e8400-e29b-41d4-a716-446655440003',
    organization: SOUTH,
    patient: 'aa2e8400-e29b-41d4-a716-446655440003',
    vet: null,
    weightKg: 0.5,
    temperatureC: 40.1,
    heartRateBpm: 200,
    anamnesis: 'Plumas erizadas',
    diagnosis: 'Infección respiratoria',
    createdAt: new Date('2026-09-22T10:00:00Z')
  }
];

export default rows;
