import { PORTAL_STATUS_VALUES, PORTAL_TYPE_VALUES } from '@/constants/portals'
import type { ListQuery } from '@/hooks/use-list-query'

export type PortalType = (typeof PORTAL_TYPE_VALUES)[number]

export type PortalStatus = (typeof PORTAL_STATUS_VALUES)[number]

export type Portal = {
  id: string
  name: string
  url: string
  type: PortalType
  visitsLast30Days: number
  bookedAppointments: number
  status: PortalStatus
}

export type PortalPreset = 'published' | 'drafts'

export type PortalFilterKey = 'type' | 'preset'

export type PortalListQuery = ListQuery<PortalFilterKey>
