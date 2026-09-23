import {productsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = productsTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {
    id: 'ee2e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    name: 'Vacuna Antirrábica',
    category: 'vaccines',
    price: 12,
    stock: 10,
    minStock: 5,
    expiry: '2027-03-12',
    createdAt: new Date('2026-01-03T00:00:00.000Z')
  },
  {
    id: 'ee2e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    name: 'Amoxicilina 250 mg',
    category: 'medications',
    price: 8.5,
    stock: 2,
    minStock: 5,
    expiry: '2026-08-01',
    createdAt: new Date('2026-01-02T00:00:00.000Z')
  },
  {
    id: 'ee2e8400-e29b-41d4-a716-446655440003',
    organization: SOUTH,
    name: 'Shampoo dermatológico',
    category: 'grooming',
    price: 14,
    stock: 20,
    minStock: 5,
    expiry: '2028-01-20',
    createdAt: new Date('2026-01-01T00:00:00.000Z')
  },
  {
    id: 'ee2e8400-e29b-41d4-a716-446655440004',
    organization: NORTH,
    name: 'Archivado Alimento',
    category: 'food',
    price: 25,
    stock: 0,
    minStock: 5,
    archivedAt: new Date('2026-01-01T00:00:00.000Z')
  }
];

export default rows;
