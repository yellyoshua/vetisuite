import type { Params } from 'react-router'
import type { ResolverSearch, SearchValue } from '@/hooks/use-resolver'
import { formatDate } from '@/lib/date'
import { matchesSearch } from '@/lib/matches-search'
import { pageRows } from '@/lib/page-rows'
import { toIsoDate } from '@/lib/to-iso-date'
import type { User, UserListRow } from '@/modules/employee/users/users.schema'

function shiftDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function recentAccessAt(daysAgo: number, time: string): string {
  return `${toIsoDate(shiftDays(new Date(), -daysAgo))}T${time}`
}

const USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Dra. María Torres',
    email: 'maria.torres@huellitas.vet',
    role: 'veterinarian',
    moduleNames: ['Atención', 'Recepción'],
    lastAccessAt: recentAccessAt(0, '07:42'),
    status: 'active',
  },
  {
    id: 'usr-2',
    name: 'Dr. Andrés Vela',
    email: 'andres.vela@huellitas.vet',
    role: 'veterinarian',
    moduleNames: ['Atención', 'Laboratorio'],
    lastAccessAt: recentAccessAt(0, '08:05'),
    status: 'active',
  },
  {
    id: 'usr-3',
    name: 'Dra. Lucía Páez',
    email: 'lucia.paez@huellitas.vet',
    role: 'veterinarian',
    moduleNames: ['Atención'],
    lastAccessAt: recentAccessAt(1, '18:20'),
    status: 'active',
  },
  {
    id: 'usr-4',
    name: 'Sofía Mena',
    email: 'sofia.mena@huellitas.vet',
    role: 'groomer',
    moduleNames: ['Estética'],
    lastAccessAt: recentAccessAt(0, '07:55'),
    status: 'active',
  },
  {
    id: 'usr-5',
    name: 'David Coro',
    email: 'david.coro@huellitas.vet',
    role: 'groomer',
    moduleNames: ['Estética'],
    lastAccessAt: recentAccessAt(0, '08:10'),
    status: 'active',
  },
  {
    id: 'usr-6',
    name: 'Valeria Cruz',
    email: 'valeria.cruz@huellitas.vet',
    role: 'reception',
    moduleNames: ['Recepción', 'Marketing'],
    lastAccessAt: recentAccessAt(0, '07:30'),
    status: 'active',
  },
  {
    id: 'usr-7',
    name: 'Ramiro Guerra',
    email: 'ramiro.guerra@huellitas.vet',
    role: 'admin',
    moduleNames: ['Todos'],
    lastAccessAt: '2026-09-04T16:40',
    status: 'suspended',
  },
]

function formatLastAccess(lastAccessAt: string, today: Date): string {
  const [date, time] = lastAccessAt.split('T')
  const relativeDayLabels: Record<string, string> = {
    [toIsoDate(today)]: 'Hoy',
    [toIsoDate(shiftDays(today, -1))]: 'Ayer',
  }
  const relativeDayLabel = relativeDayLabels[date]
  if (!relativeDayLabel) {
    return formatDate(`${date}T00:00:00`, { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return `${relativeDayLabel} · ${time}`
}

function filterUsers(search: ResolverSearch): User[] {
  const role = asText(search.role)
  const status = asText(search.status)

  return USERS.filter(
    (user) =>
      matchesSearch(asText(search.search), [user.name, user.email]) &&
      (!role || user.role === role) &&
      (!status || user.status === status),
  )
}

function resolveUsers(search: ResolverSearch): Promise<UserListRow[]> {
  return Promise.resolve().then(() => {
    const today = new Date()

    return pageRows(filterUsers(search), search.page).map((user) => ({ ...user, lastAccessLabel: formatLastAccess(user.lastAccessAt, today) }))
  })
}

function asText(value: SearchValue | undefined): string {
  return value === undefined || value === null ? '' : String(value)
}

export default {
  users: (_params: Readonly<Params>, search: ResolverSearch) => resolveUsers(search),
}
