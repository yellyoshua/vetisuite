import { CLINIC_RECORD_STATUS_VALUES } from '@/constants/clinic'
import type { ListQuery } from '@/hooks/use-list-query'

export type ClinicRecordStatus = (typeof CLINIC_RECORD_STATUS_VALUES)[number]

export type ClinicRecordKind = 'consultation' | 'lab-order' | 'prescription'

export type ClinicRecord = {
  id: string
  patientName: string
  ownerName: string
  kind: ClinicRecordKind
  title: string
  date: string
  time: string
  responsible: string
  status: ClinicRecordStatus
  resolvedAt: string | null
}

export type ClinicRecordPreset = 'pending-result' | 'resolved-today'

export type ClinicRecordFilterKey = 'kind' | 'preset'

export type ClinicRecordListQuery = ListQuery<ClinicRecordFilterKey>
