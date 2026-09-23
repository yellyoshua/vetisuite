import {appointmentsAvailabilityTable} from '@vetisuite/database/schemas/schemas.js';

export const table = appointmentsAvailabilityTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';
const PLATFORM = '552e8400-e29b-41d4-a716-446655440003';

const defaultWeek = [
  {weekday: 'monday', enabled: true, ranges: [{start: '08:00', end: '13:00'}, {start: '14:00', end: '18:00'}]},
  {weekday: 'tuesday', enabled: true, ranges: [{start: '08:00', end: '13:00'}, {start: '14:00', end: '18:00'}]},
  {weekday: 'wednesday', enabled: true, ranges: [{start: '08:00', end: '13:00'}, {start: '14:00', end: '18:00'}]},
  {weekday: 'thursday', enabled: true, ranges: [{start: '08:00', end: '13:00'}, {start: '14:00', end: '18:00'}]},
  {weekday: 'friday', enabled: true, ranges: [{start: '08:00', end: '13:00'}, {start: '14:00', end: '18:00'}]},
  {weekday: 'saturday', enabled: true, ranges: [{start: '09:00', end: '14:00'}]},
  {weekday: 'sunday', enabled: false, ranges: [{start: '09:00', end: '13:00'}]}
];

const defaultOverrides = [
  {id: 'exc-1', date: '2026-10-12', label: 'Feriado nacional', ranges: []},
  {id: 'exc-2', date: '2026-11-02', label: 'Feriado guardia', ranges: [{start: '10:00', end: '14:00'}]}
];

const rows = [
  {
    id: '882e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    timezone: 'America/Guayaquil',
    week: defaultWeek,
    overrides: defaultOverrides,
    slotMinutes: 30,
    bufferBefore: 0,
    bufferAfter: 10,
    minNoticeHours: 2,
    maxAdvanceDays: 30,
    maxPerDay: 20,
    onlineBooking: true,
    autoConfirm: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z')
  },
  {
    id: '882e8400-e29b-41d4-a716-446655440002',
    organization: SOUTH,
    timezone: 'America/Bogota',
    week: defaultWeek,
    overrides: [],
    slotMinutes: 45,
    bufferBefore: 0,
    bufferAfter: 15,
    minNoticeHours: 12,
    maxAdvanceDays: 60,
    maxPerDay: 15,
    onlineBooking: false,
    autoConfirm: true,
    createdAt: new Date('2026-01-02T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z')
  },
  {
    id: '882e8400-e29b-41d4-a716-446655440003',
    organization: PLATFORM,
    timezone: 'America/Guayaquil',
    week: defaultWeek,
    overrides: [],
    slotMinutes: 30,
    bufferBefore: 0,
    bufferAfter: 0,
    minNoticeHours: 0,
    maxAdvanceDays: 15,
    maxPerDay: 10,
    onlineBooking: true,
    autoConfirm: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    archivedAt: new Date('2026-01-03T00:00:00.000Z')
  }
];

export default rows;
