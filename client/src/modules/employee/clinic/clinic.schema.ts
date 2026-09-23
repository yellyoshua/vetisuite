import { CLINIC_RECORD_STATUS_VALUES } from '@/constants/clinic'

export type ClinicRecordStatus = (typeof CLINIC_RECORD_STATUS_VALUES)[number]

export type ClinicRecordKind = 'consultation' | 'lab-order' | 'prescription'

export type ClinicRecord = {
  id: string
  patientName: string
  ownerName: string
  kind: ClinicRecordKind
  title: string
  createdAt: string
  responsible: string
  status: ClinicRecordStatus
  resolvedAt: string | null
}

export type ClinicRecordPreset = 'pending-result' | 'resolved-today'
