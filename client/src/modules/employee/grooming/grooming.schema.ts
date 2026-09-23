import { GROOMING_STATUS_VALUES } from '@/constants/grooming'

export type GroomingStatus = (typeof GROOMING_STATUS_VALUES)[number]

export type GroomingService = {
  id: string
  patientName: string
  ownerName: string
  serviceName: string
  stylistName: string
  checkInTime: string
  status: GroomingStatus
}

export type GroomingPreset = 'undelivered' | 'delivered'
