import { z } from 'zod'
import type { VISIT_STATUS_VALUES, VISIT_TYPE_VALUES } from '@/constants/visits'

export type VisitStatus = (typeof VISIT_STATUS_VALUES)[number]

export type VisitType = (typeof VISIT_TYPE_VALUES)[number]

export type VisitScope = 'all' | VisitType

export type Visit = {
  id: string
  type: VisitType
  patientName: string
  ownerName: string
  service: string
  staffName: string
  time: string
  status: VisitStatus
}

export type VisitFilterKey = 'staff'

export type VisitBoardQuery = {
  scope: VisitScope
  search: string
  staff: string
}

export type VisitBoardColumn = {
  status: VisitStatus
  visits: Visit[]
}

export type VisitBoardSummary = {
  openCount: number
  billableCount: number
}

export type VisitBoard = {
  columns: VisitBoardColumn[]
  staffNames: string[]
  summary: VisitBoardSummary
}

export const visitAdvanceSchema = z.object({
  visitId: z.string().trim().min(1, 'La visita es obligatoria'),
})

export type VisitAdvanceInput = z.infer<typeof visitAdvanceSchema>
