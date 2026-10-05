import {whatsappAccountsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = whatsappAccountsTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {id: 'aa2e8400-e29b-41d4-a716-446655440001', organization: NORTH, wabaId: '9001', phoneNumberId: '8001', displayPhoneNumber: '+593 99 111 1111', verifiedName: 'Clínica Norte', accessToken: 'v1.cifrado.norte.token', consentAcceptedAt: new Date('2026-09-01T00:00:00.000Z')},
  {id: 'aa2e8400-e29b-41d4-a716-446655440002', organization: SOUTH, wabaId: '9002', phoneNumberId: '8002', displayPhoneNumber: '+57 300 222 2222', verifiedName: 'Clínica Sur', accessToken: 'v1.cifrado.sur.token', consentAcceptedAt: new Date('2026-09-01T00:00:00.000Z')}
];

export default rows;
