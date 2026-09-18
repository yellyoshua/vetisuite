import type { ListPage } from '@/hooks/use-list-query'
import { matchesSearch } from '@/lib/matches-search'
import { paginateRows } from '@/lib/paginate-rows'
import type { Portal, PortalListQuery, PortalPreset, PortalStatus } from '../portals.schema'

const PRESET_STATUS: Record<PortalPreset, PortalStatus> = {
  published: 'active',
  drafts: 'draft',
}

const PORTALS: Portal[] = [
  {
    id: 'por-1',
    name: 'Portal de la clínica',
    url: 'clinica-a.vetisuite.com/p/clinica',
    type: 'institutional',
    visitsLast30Days: 1248,
    bookedAppointments: 37,
    status: 'active',
  },
  {
    id: 'por-2',
    name: 'Reserva en línea',
    url: 'clinica-a.vetisuite.com/p/reservas',
    type: 'booking',
    visitsLast30Days: 612,
    bookedAppointments: 54,
    status: 'active',
  },
  {
    id: 'por-3',
    name: 'Campaña de vacunación',
    url: 'clinica-a.vetisuite.com/p/vacunacion-2026',
    type: 'campaign',
    visitsLast30Days: 0,
    bookedAppointments: 0,
    status: 'draft',
  },
]

function filterPortals({ search, filters }: PortalListQuery): Portal[] {
  return PORTALS.filter(
    (portal) =>
      matchesSearch(search, [portal.name, portal.url]) &&
      (!filters.type || portal.type === filters.type) &&
      (!filters.preset || portal.status === PRESET_STATUS[filters.preset as PortalPreset]),
  )
}

export function resolvePortalsList(query: PortalListQuery): Promise<ListPage<Portal>> {
  return Promise.resolve().then(() => paginateRows(filterPortals(query), query))
}
