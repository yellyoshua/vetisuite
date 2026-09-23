import { APPOINTMENT_STATUS_VALUES } from '@/constants/appointments'

export type AppointmentStatus = (typeof APPOINTMENT_STATUS_VALUES)[number]

export type AppointmentPatient = {
  id: string
  name: string
}

export type AppointmentVet = {
  id: string
  firstName: string
  lastName: string
}

export type Appointment = {
  id: string
  startsAt: string
  durationMinutes: number
  reason: string
  status: AppointmentStatus
  source: string
  createdAt: string
  updatedAt: string
  patient: AppointmentPatient
  vet: AppointmentVet | null
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
