import type { ListPage } from '@/hooks/use-list-query'
import { matchesSearch } from '@/lib/matches-search'
import { paginateRows } from '@/lib/paginate-rows'
import { toIsoDate } from '@/lib/to-iso-date'
import type { BillingDocument, BillingListQuery, BillingPreset } from '../billing.schema'

const MOCK_TODAY = toIsoDate(new Date())

const BILLING_DOCUMENTS: BillingDocument[] = [
  {
    id: 'bil-1',
    clientName: 'Elena Buitrón',
    kind: 'account',
    number: '#1042',
    chargeCount: 3,
    total: 47,
    createdAt: '2026-09-06',
    dueDate: null,
    paidAt: null,
    status: 'open',
  },
  {
    id: 'bil-2',
    clientName: 'Carolina Ríos',
    kind: 'account',
    number: '#1041',
    chargeCount: 2,
    total: 30,
    createdAt: '2026-09-06',
    dueDate: null,
    paidAt: null,
    status: 'open',
  },
  {
    id: 'bil-3',
    clientName: 'Lucía Benítez',
    kind: 'account',
    number: '#1040',
    chargeCount: 2,
    total: 36,
    createdAt: '2026-09-04',
    dueDate: null,
    paidAt: null,
    status: 'open',
  },
  {
    id: 'bil-4',
    clientName: 'Ricardo Guamán',
    kind: 'invoice',
    number: '001-0321',
    chargeCount: 1,
    total: 22,
    createdAt: '2026-09-02',
    dueDate: '2026-09-21',
    paidAt: MOCK_TODAY,
    status: 'paid',
  },
  {
    id: 'bil-5',
    clientName: 'Gabriela Montes',
    kind: 'invoice',
    number: '001-0320',
    chargeCount: 2,
    total: 41,
    createdAt: '2026-08-30',
    dueDate: '2026-09-18',
    paidAt: MOCK_TODAY,
    status: 'paid',
  },
  {
    id: 'bil-6',
    clientName: 'Diego Carrión',
    kind: 'invoice',
    number: '001-0319',
    chargeCount: 2,
    total: 33.5,
    createdAt: '2026-08-26',
    dueDate: '2026-09-30',
    paidAt: null,
    status: 'receivable',
  },
  {
    id: 'bil-7',
    clientName: 'Marco Salazar',
    kind: 'invoice',
    number: '001-0318',
    chargeCount: 4,
    total: 45.5,
    createdAt: '2026-08-22',
    dueDate: '2026-09-10',
    paidAt: null,
    status: 'receivable',
  },
  {
    id: 'bil-8',
    clientName: 'Jorge Paredes',
    kind: 'invoice',
    number: '001-0317',
    chargeCount: 2,
    total: 28,
    createdAt: '2026-08-14',
    dueDate: '2026-09-02',
    paidAt: '2026-08-20',
    status: 'paid',
  },
  {
    id: 'bil-9',
    clientName: 'Andrés Lema',
    kind: 'invoice',
    number: '001-0316',
    chargeCount: 1,
    total: 18,
    createdAt: '2026-06-29',
    dueDate: '2026-07-18',
    paidAt: '2026-06-29',
    status: 'paid',
  },
  {
    id: 'bil-10',
    clientName: 'Fernando Ortiz',
    kind: 'invoice',
    number: '001-0315',
    chargeCount: 3,
    total: 39,
    createdAt: '2026-06-24',
    dueDate: '2026-07-13',
    paidAt: '2026-07-01',
    status: 'paid',
  },
  {
    id: 'bil-11',
    clientName: 'Sofía Villacís',
    kind: 'invoice',
    number: '001-0314',
    chargeCount: 2,
    total: 26.5,
    createdAt: '2026-06-20',
    dueDate: '2026-07-09',
    paidAt: '2026-07-08',
    status: 'paid',
  },
  {
    id: 'bil-12',
    clientName: 'Paula Andrade',
    kind: 'invoice',
    number: '001-0312',
    chargeCount: 3,
    total: 52,
    createdAt: '2026-06-12',
    dueDate: '2026-08-28',
    paidAt: null,
    status: 'receivable',
  },
]

function matchesPreset(billingDocument: BillingDocument, preset: BillingPreset, today: string): boolean {
  const presetRules: Record<BillingPreset, boolean> = {
    'open-account': billingDocument.status === 'open',
    overdue: billingDocument.status === 'receivable' && billingDocument.dueDate !== null && billingDocument.dueDate < today,
    'paid-today': billingDocument.paidAt === today,
  }

  return presetRules[preset]
}

function filterBillingDocuments({ search, filters }: BillingListQuery): BillingDocument[] {
  const today = toIsoDate(new Date())

  return BILLING_DOCUMENTS.filter(
    (billingDocument) =>
      matchesSearch(search, [billingDocument.clientName, billingDocument.number]) &&
      (!filters.status || billingDocument.status === filters.status) &&
      (!filters.preset || matchesPreset(billingDocument,filters.preset as BillingPreset, today)),
  )
}

export function resolveBillingList(query: BillingListQuery): Promise<ListPage<BillingDocument>> {
  return Promise.resolve().then(() => paginateRows(filterBillingDocuments(query), query))
}
