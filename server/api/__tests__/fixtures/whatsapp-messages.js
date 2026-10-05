import {whatsappMessagesTable} from '@vetisuite/database/schemas/schemas.js';

export const table = whatsappMessagesTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';
const NOW = Date.now();
const HOUR = 60 * 60 * 1000;

const rows = [
  {id: 'cc2e8400-e29b-41d4-a716-446655440001', organization: NORTH, direction: 'outbound', status: 'read', wamid: 'wamid.read', phone: '+593991111111', template: 'appointment_reminder', createdAt: new Date(NOW - HOUR)},
  {id: 'cc2e8400-e29b-41d4-a716-446655440002', organization: NORTH, direction: 'outbound', status: 'delivered', wamid: 'wamid.delivered', phone: '+593991111112', template: 'appointment_reminder', createdAt: new Date(NOW - HOUR)},
  {id: 'cc2e8400-e29b-41d4-a716-446655440003', organization: NORTH, direction: 'outbound', status: 'sent', wamid: 'wamid.sent', phone: '+593991111113', template: 'vaccine_due_reminder', createdAt: new Date(NOW - HOUR)},
  {id: 'cc2e8400-e29b-41d4-a716-446655440004', organization: NORTH, direction: 'outbound', status: 'failed', wamid: 'wamid.failed', phone: '+593991111114', template: 'appointment_reminder', errorCode: 131026, errorMessage: 'No está en WhatsApp', createdAt: new Date(NOW - HOUR)},
  {id: 'cc2e8400-e29b-41d4-a716-446655440005', organization: NORTH, direction: 'inbound', status: 'delivered', wamid: 'wamid.in1', phone: '+593991111111', createdAt: new Date(NOW - HOUR)},
  {id: 'cc2e8400-e29b-41d4-a716-446655440006', organization: NORTH, direction: 'inbound', status: 'delivered', wamid: 'wamid.in2', phone: '+593991111112', createdAt: new Date(NOW - 2 * HOUR)},
  {id: 'cc2e8400-e29b-41d4-a716-446655440007', organization: NORTH, direction: 'outbound', status: 'sent', wamid: 'wamid.app', phone: '+593991111115', createdAt: new Date(NOW - HOUR)},
  {id: 'cc2e8400-e29b-41d4-a716-446655440008', organization: NORTH, direction: 'outbound', status: 'sent', wamid: 'wamid.old', phone: '+593991111116', template: 'appointment_reminder', createdAt: new Date(NOW - 20 * 24 * HOUR)},
  {id: 'cc2e8400-e29b-41d4-a716-446655440009', organization: SOUTH, direction: 'outbound', status: 'sent', wamid: 'wamid.south', phone: '+573001111111', template: 'appointment_reminder', createdAt: new Date(NOW - HOUR)}
];

export default rows;
