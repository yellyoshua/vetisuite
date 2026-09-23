import {invoicesTable} from '@vetisuite/database/schemas/schemas.js';

export const table = invoicesTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';
const CLIENT_1 = '992e8400-e29b-41d4-a716-446655440001';
const CLIENT_2 = '992e8400-e29b-41d4-a716-446655440002';
const CLIENT_SOUTH = '992e8400-e29b-41d4-a716-446655440003';

const rows = [
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    client: CLIENT_1,
    number: 101,
    subtotal: 1000,
    discount: 0,
    discountPercent: 0,
    tax: 150,
    previousDebt: 0,
    total: 1150,
    method: 'cash',
    createdAt: new Date('2026-09-10T10:00:00.000Z')
  },
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    client: CLIENT_2,
    number: 102,
    subtotal: 2000,
    discount: 0,
    discountPercent: 0,
    tax: 300,
    previousDebt: 0,
    total: 2300,
    method: 'card',
    createdAt: new Date('2026-09-12T11:00:00.000Z')
  },
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440003',
    organization: NORTH,
    client: CLIENT_1,
    number: 103,
    subtotal: 1200,
    discount: 0,
    discountPercent: 0,
    tax: 180,
    previousDebt: 0,
    total: 1380,
    method: 'transfer',
    createdAt: new Date('2026-09-14T12:00:00.000Z')
  },
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440004',
    organization: NORTH,
    client: CLIENT_1,
    number: 104,
    subtotal: 3000,
    discount: 0,
    discountPercent: 0,
    tax: 450,
    previousDebt: 0,
    total: 3450,
    method: 'cash',
    createdAt: new Date('2026-08-10T10:00:00.000Z')
  },
  {
    id: 'aa1e8400-e29b-41d4-a716-446655440005',
    organization: SOUTH,
    client: CLIENT_SOUTH,
    number: 201,
    subtotal: 500,
    discount: 0,
    discountPercent: 0,
    tax: 75,
    previousDebt: 0,
    total: 575,
    method: 'card',
    createdAt: new Date('2026-09-10T15:00:00.000Z')
  }
];

export default rows;
