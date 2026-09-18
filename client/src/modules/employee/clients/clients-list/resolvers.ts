import type { ListPage } from '@/hooks/use-list-query'
import { matchesSearch } from '@/lib/matches-search'
import { paginateRows } from '@/lib/paginate-rows'
import { toIsoDate } from '@/lib/to-iso-date'
import type { Client, ClientListQuery, ClientPreset } from '../clients.schema'

const RECENT_VISIT_MONTHS = 6

export const CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Carolina Ríos',
    nationalId: '1712345678',
    phone: '099 812 4471',
    email: 'carolina.rios@mail.com',
    status: 'active',
    hasOpenAccount: true,
    createdAt: '2025-03-10',
    lastVisitAt: '2026-09-06',
    petNames: ['Max', 'Luna'],
  },
  {
    id: 'cli-2',
    name: 'Marco Salazar',
    nationalId: '1798765432',
    phone: '098 445 1120',
    email: 'marco.salazar@mail.com',
    status: 'active',
    hasOpenAccount: false,
    createdAt: '2025-06-02',
    lastVisitAt: '2026-08-22',
    petNames: ['Rocky'],
  },
  {
    id: 'cli-3',
    name: 'Jorge Paredes',
    nationalId: '1703344556',
    phone: '097 220 8834',
    email: 'jparedes@mail.com',
    status: 'active',
    hasOpenAccount: false,
    createdAt: '2024-11-20',
    lastVisitAt: '2026-08-14',
    petNames: ['Nala'],
  },
  {
    id: 'cli-4',
    name: 'Elena Buitrón',
    nationalId: '1755667788',
    phone: '096 771 2093',
    email: 'elena.b@mail.com',
    status: 'active',
    hasOpenAccount: true,
    createdAt: '2026-09-01',
    lastVisitAt: '2026-09-06',
    petNames: ['Kiwi'],
  },
  {
    id: 'cli-5',
    name: 'Paula Andrade',
    nationalId: '1722114499',
    phone: '099 034 7712',
    email: 'paula.andrade@mail.com',
    status: 'inactive',
    hasOpenAccount: false,
    createdAt: '2024-08-15',
    lastVisitAt: '2026-07-02',
    petNames: ['Simba', 'Coco'],
  },
  {
    id: 'cli-6',
    name: 'Andrés Lema',
    nationalId: '1788990011',
    phone: '098 610 4457',
    email: 'alema@mail.com',
    status: 'inactive',
    hasOpenAccount: false,
    createdAt: '2025-01-05',
    lastVisitAt: '2026-06-29',
    petNames: ['Toby'],
  },
  {
    id: 'cli-7',
    name: 'Gabriela Montes',
    nationalId: '1709988776',
    phone: '099 551 3302',
    email: 'gabriela.montes@mail.com',
    status: 'active',
    hasOpenAccount: false,
    createdAt: '2026-09-09',
    lastVisitAt: '2026-09-10',
    petNames: ['Bruno'],
  },
  {
    id: 'cli-8',
    name: 'Diego Carrión',
    nationalId: '1744556677',
    phone: '098 772 1904',
    email: 'diego.carrion@mail.com',
    status: 'active',
    hasOpenAccount: false,
    createdAt: '2025-02-11',
    lastVisitAt: '2026-02-14',
    petNames: ['Mía'],
  },
  {
    id: 'cli-9',
    name: 'Lucía Benítez',
    nationalId: '1733221100',
    phone: '097 318 6620',
    email: 'lucia.benitez@mail.com',
    status: 'active',
    hasOpenAccount: true,
    createdAt: '2025-10-01',
    lastVisitAt: '2026-08-30',
    petNames: ['Pelusa', 'Canela'],
  },
  {
    id: 'cli-10',
    name: 'Fernando Ortiz',
    nationalId: '1766554433',
    phone: '096 204 7781',
    email: '',
    status: 'active',
    hasOpenAccount: false,
    createdAt: '2026-09-15',
    lastVisitAt: null,
    petNames: ['Thor'],
  },
  {
    id: 'cli-11',
    name: 'Sofía Villacís',
    nationalId: '1711002233',
    phone: '099 880 1456',
    email: 'sofia.villacis@mail.com',
    status: 'inactive',
    hasOpenAccount: false,
    createdAt: '2024-05-19',
    lastVisitAt: '2025-12-03',
    petNames: ['Chispa'],
  },
  {
    id: 'cli-12',
    name: 'Ricardo Guamán',
    nationalId: '1799887766',
    phone: '098 903 2215',
    email: 'ricardo.guaman@mail.com',
    status: 'active',
    hasOpenAccount: false,
    createdAt: '2025-07-23',
    lastVisitAt: '2026-09-12',
    petNames: ['Rex'],
  },
]

function matchesPreset(client: Client, preset: ClientPreset, today: Date): boolean {
  const monthStart = toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1))
  const recentVisitLimit = toIsoDate(new Date(today.getFullYear(), today.getMonth() - RECENT_VISIT_MONTHS, today.getDate()))
  const presetRules: Record<ClientPreset, boolean> = {
    'open-account': client.hasOpenAccount,
    'new-this-month': client.createdAt >= monthStart,
    'no-recent-visit': client.lastVisitAt === null || client.lastVisitAt < recentVisitLimit,
  }

  return presetRules[preset]
}

function filterClients({ search, filters }: ClientListQuery): Client[] {
  const today = new Date()

  return CLIENTS.filter(
    (client) =>
      matchesSearch(search, [client.name, client.nationalId, ...client.petNames]) &&
      (!filters.status || client.status === filters.status) &&
      (!filters.preset || matchesPreset(client, filters.preset as ClientPreset, today)),
  )
}

export function resolveClientsList(query: ClientListQuery): Promise<ListPage<Client>> {
  return Promise.resolve().then(() => paginateRows(filterClients(query), query))
}
