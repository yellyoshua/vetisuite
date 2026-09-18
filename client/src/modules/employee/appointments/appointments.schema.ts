import { APPOINTMENT_STATUS_VALUES } from '@/constants/appointments'
import type { ListQuery } from '@/hooks/use-list-query'

export type AppointmentStatus = (typeof APPOINTMENT_STATUS_VALUES)[number]

export type Appointment = {
  id: string
  patientName: string
  ownerName: string
  date: string
  time: string
  reason: string
  doctorId: string
  doctorName: string
  status: AppointmentStatus
}

export type AppointmentDoctor = {
  id: string
  name: string
}

export type AppointmentsAgenda = {
  dayLabel: string
  previousDate: string
  nextDate: string
  doctors: AppointmentDoctor[]
}

export type AppointmentsAgendaQuery = {
  date: string
}

export type AppointmentFilterKey = 'status' | 'doctor' | 'date'

export type AppointmentListQuery = ListQuery<AppointmentFilterKey>
