import { PORTAL_PURPOSE_VALUES, PORTAL_STATUS_VALUES, PORTAL_TYPE_VALUES } from '@/constants/portals'

export type PortalPurpose = (typeof PORTAL_PURPOSE_VALUES)[number]
export type PortalType = (typeof PORTAL_TYPE_VALUES)[number]

export type PortalStatus = (typeof PORTAL_STATUS_VALUES)[number]

export type Portal = {
  id: string
  name: string
  slug: string
  purpose: PortalPurpose
  bookedAppointments: number
  status: PortalStatus
  createdAt?: string
  updatedAt?: string
}

export type PortalPreset = 'published' | 'drafts'
