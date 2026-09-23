import {invoicesTable} from '@vetisuite/database/schemas/schemas.js';

export const table = invoicesTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';
const CARLA = '992e8400-e29b-41d4-a716-446655440001';
const JORGE = '992e8400-e29b-41d4-a716-446655440002';
const AJENA = '992e8400-e29b-41d4-a716-446655440003';

const rows = [
  {
    id: '112e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    client: CARLA,
    number: 1040,
    subtotal: 30,
    discount: 0,
    discountPercent: 0,
    tax: 4.5,
    previousDebt: 0,
    total: 34.5,
    method: 'cash',
    createdAt: new Date('2026-01-05T10:00:00.000Z')
  },
  {
    id: '112e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    client: JORGE,
    number: 1041,
    subtotal: 0,
    discount: 0,
    discountPercent: 0,
    tax: 0,
    previousDebt: 0,
    total: 0,
    method: 'card',
    createdAt: new Date('2026-01-06T10:00:00.000Z')
  },
  {
    id: '112e8400-e29b-41d4-a716-446655440003',
    organization: NORTH,
    client: CARLA,
    number: 1042,
    subtotal: 40,
    discount: 0,
    discountPercent: 0,
    tax: 6,
    previousDebt: 20,
    total: 66,
    method: 'transfer',
    createdAt: new Date('2026-01-07T10:00:00.000Z')
  },
  {
    id: '112e8400-e29b-41d4-a716-446655440004',
    organization: SOUTH,
    client: AJENA,
    number: 2001,
    subtotal: 50,
    discount: 0,
    discountPercent: 0,
    tax: 7.5,
    previousDebt: 0,
    total: 57.5,
    method: 'cash',
    createdAt: new Date('2026-01-08T10:00:00.000Z')
  }
];

export default rows;
