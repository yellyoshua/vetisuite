import type { ListPage } from '@/hooks/use-list-query'
import { matchesSearch } from '@/lib/matches-search'
import { paginateRows } from '@/lib/paginate-rows'
import { toIsoDate } from '@/lib/to-iso-date'
import type { ClinicRecord, ClinicRecordListQuery, ClinicRecordPreset } from '../clinic.schema'

const MOCK_TODAY = toIsoDate(new Date())

const CLINIC_RECORDS: ClinicRecord[] = [
  {
    id: 'cln-1',
    patientName: 'Kiwi',
    ownerName: 'Elena Buitrón',
    kind: 'consultation',
    title: 'Consulta médica',
    date: '2026-09-06',
    time: '09:20',
    responsible: 'Dra. María Torres',
    status: 'in-progress',
    resolvedAt: null,
  },
  {
    id: 'cln-2',
    patientName: 'Rocky',
    ownerName: 'Marco Salazar',
    kind: 'lab-order',
    title: 'Hemograma completo',
    date: '2026-09-06',
    time: '10:20',
    responsible: 'Lab. externo',
    status: 'requested',
    resolvedAt: null,
  },
  {
    id: 'cln-3',
    patientName: 'Max',
    ownerName: 'Carolina Ríos',
    kind: 'lab-order',
    title: 'Coproparasitario',
    date: '2026-09-06',
    time: '09:05',
    responsible: 'Lab. interno',
    status: 'result',
    resolvedAt: '2026-09-06',
  },
  {
    id: 'cln-4',
    patientName: 'Nala',
    ownerName: 'Jorge Paredes',
    kind: 'prescription',
    title: 'Receta y control',
    date: '2026-09-05',
    time: '11:40',
    responsible: 'Dra. Lucía Páez',
    status: 'result',
    resolvedAt: '2026-09-05',
  },
  {
    id: 'cln-5',
    patientName: 'Simba',
    ownerName: 'Paula Andrade',
    kind: 'lab-order',
    title: 'Perfil renal',
    date: '2026-09-04',
    time: '16:10',
    responsible: 'Lab. externo',
    status: 'result',
    resolvedAt: '2026-09-05',
  },
  {
    id: 'cln-6',
    patientName: 'Toby',
    ownerName: 'Andrés Lema',
    kind: 'lab-order',
    title: 'Urianálisis',
    date: '2026-09-04',
    time: '12:15',
    responsible: 'Lab. interno',
    status: 'result',
    resolvedAt: MOCK_TODAY,
  },
  {
    id: 'cln-7',
    patientName: 'Bruno',
    ownerName: 'Gabriela Montes',
    kind: 'lab-order',
    title: 'Perfil hepático',
    date: '2026-09-03',
    time: '15:40',
    responsible: 'Lab. externo',
    status: 'result',
    resolvedAt: MOCK_TODAY,
  },
  {
    id: 'cln-8',
    patientName: 'Luna',
    ownerName: 'Carolina Ríos',
    kind: 'consultation',
    title: 'Consulta de control',
    date: '2026-09-03',
    time: '09:00',
    responsible: 'Dr. Andrés Vela',
    status: 'result',
    resolvedAt: '2026-09-03',
  },
  {
    id: 'cln-9',
    patientName: 'Mía',
    ownerName: 'Diego Carrión',
    kind: 'lab-order',
    title: 'Citología de oído',
    date: '2026-09-02',
    time: '11:10',
    responsible: 'Lab. interno',
    status: 'requested',
    resolvedAt: null,
  },
  {
    id: 'cln-10',
    patientName: 'Pelusa',
    ownerName: 'Lucía Benítez',
    kind: 'prescription',
    title: 'Receta de antibiótico',
    date: '2026-09-02',
    time: '16:45',
    responsible: 'Dra. María Torres',
    status: 'result',
    resolvedAt: '2026-09-02',
  },
  {
    id: 'cln-11',
    patientName: 'Thor',
    ownerName: 'Fernando Ortiz',
    kind: 'lab-order',
    title: 'Raspado de piel',
    date: '2026-09-01',
    time: '10:05',
    responsible: 'Lab. interno',
    status: 'in-progress',
    resolvedAt: null,
  },
  {
    id: 'cln-12',
    patientName: 'Rex',
    ownerName: 'Ricardo Guamán',
    kind: 'prescription',
    title: 'Receta de antiinflamatorio',
    date: '2026-09-01',
    time: '17:20',
    responsible: 'Dr. Andrés Vela',
    status: 'result',
    resolvedAt: '2026-09-01',
  },
]

function matchesPreset(record: ClinicRecord, preset: ClinicRecordPreset, today: string): boolean {
  const presetRules: Record<ClinicRecordPreset, boolean> = {
    'pending-result': record.status !== 'result',
    'resolved-today': record.status === 'result' && record.resolvedAt === today,
  }

  return presetRules[preset]
}

function filterClinicRecords({ search, filters }: ClinicRecordListQuery): ClinicRecord[] {
  const today = toIsoDate(new Date())

  return CLINIC_RECORDS.filter(
    (record) =>
      matchesSearch(search, [record.patientName, record.title]) &&
      (!filters.kind || record.kind === filters.kind) &&
      (!filters.preset || matchesPreset(record, filters.preset as ClinicRecordPreset, today)),
  )
}

export function resolveClinicRecordsList(query: ClinicRecordListQuery): Promise<ListPage<ClinicRecord>> {
  return Promise.resolve().then(() => paginateRows(filterClinicRecords(query), query))
}
