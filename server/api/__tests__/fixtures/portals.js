import {portalsTable} from '@vetisuite/database/schemas/schemas.js';

export const table = portalsTable;

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';

const rows = [
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440001',
    organization: NORTH,
    name: 'Portal de la clínica',
    slug: 'clinica',
    purpose: 'booking',
    status: 'published',
    palettePrimary: '#0f766e',
    paletteAccent: '#14b8a6',
    paletteBackground: '#ffffff',
    markdown: '# Bienvenidos',
    logoUrl: 'https://example.com/logo.png',
    vetPolicy: 'clinic_assigns',
    createdAt: new Date('2026-01-03T00:00:00.000Z')
  },
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440002',
    organization: NORTH,
    name: 'Campaña de vacunación',
    slug: 'vacunacion-2026',
    purpose: 'capture',
    campaignName: 'Vacunación 2026',
    status: 'draft',
    palettePrimary: '#0f766e',
    paletteAccent: '#14b8a6',
    paletteBackground: '#ffffff',
    markdown: '# Campaña',
    logoUrl: 'https://example.com/logo.png',
    vetPolicy: 'clinic_assigns',
    createdAt: new Date('2026-01-02T00:00:00.000Z')
  },
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440003',
    organization: SOUTH,
    name: 'Portal Sur',
    slug: 'portal-sur',
    purpose: 'booking',
    status: 'published',
    palettePrimary: '#0f766e',
    paletteAccent: '#14b8a6',
    paletteBackground: '#ffffff',
    markdown: '# Portal Sur',
    logoUrl: 'https://example.com/logo.png',
    vetPolicy: 'clinic_assigns',
    createdAt: new Date('2026-01-01T00:00:00.000Z')
  },
  {
    id: 'bb2e8400-e29b-41d4-a716-446655440004',
    organization: NORTH,
    name: 'Portal Archivado',
    slug: 'archivado',
    purpose: 'booking',
    status: 'published',
    palettePrimary: '#0f766e',
    paletteAccent: '#14b8a6',
    paletteBackground: '#ffffff',
    markdown: '# Archivado',
    logoUrl: 'https://example.com/logo.png',
    vetPolicy: 'clinic_assigns',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    archivedAt: new Date('2026-01-04T00:00:00.000Z')
  }
];

export default rows;
