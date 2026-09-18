import type { ReceptionSummary } from '../dashboard.schema'

const RECEPTION_SUMMARY: ReceptionSummary = {
  kpis: {
    todayAppointments: { value: '4', detail: 'domingo, 6 de septiembre' },
    confirmed: { value: '2', detail: '50% de la agenda' },
    pending: { value: '1', detail: 'por confirmar' },
    attendance: { value: '86%', detail: 'últimos 30 días' },
  },
  dailyAppointments: [
    { label: 'lun', value: 6, isToday: false },
    { label: 'mar', value: 9, isToday: false },
    { label: 'mié', value: 7, isToday: false },
    { label: 'jue', value: 11, isToday: false },
    { label: 'vie', value: 12, isToday: false },
    { label: 'sáb', value: 8, isToday: false },
    { label: 'hoy', value: 4, isToday: true },
  ],
  todayStatuses: {
    total: '4',
    segments: [
      { label: 'Confirmadas', value: '2', percent: 50, tone: 'green' },
      { label: 'Pendientes', value: '1', percent: 25, tone: 'amber' },
      { label: 'Completadas', value: '1', percent: 25, tone: 'blue' },
    ],
    cancelledOrNoShow: '0',
  },
  demandHours: [
    { label: '08–10', value: 34, percent: 83 },
    { label: '10–12', value: 41, percent: 100 },
    { label: '12–14', value: 18, percent: 44 },
    { label: '14–16', value: 27, percent: 66 },
    { label: '16–18', value: 36, percent: 88 },
    { label: '18–20', value: 22, percent: 54 },
  ],
  agenda: [
    {
      id: 'apt-1',
      time: '08:30',
      patientName: 'Kiwi',
      ownerName: 'Elena Buitrón',
      detail: 'Consulta general · Dra. Lucía Páez',
      status: 'completada',
      tone: 'blue',
    },
    {
      id: 'apt-2',
      time: '09:00',
      patientName: 'Max',
      ownerName: 'Carolina Ríos',
      detail: 'Vacunación anual · Dra. María Torres',
      status: 'confirmada',
      tone: 'green',
    },
    {
      id: 'apt-3',
      time: '10:00',
      patientName: 'Rocky',
      ownerName: 'Marco Salazar',
      detail: 'Control dermatológico · Dr. Andrés Vela',
      status: 'pendiente',
      tone: 'amber',
    },
    {
      id: 'apt-4',
      time: '11:00',
      patientName: 'Nala',
      ownerName: 'Jorge Paredes',
      detail: 'Chequeo geriátrico · Dra. María Torres',
      status: 'confirmada',
      tone: 'green',
    },
  ],
}

export function resolveReceptionSummary(): Promise<ReceptionSummary> {
  return Promise.resolve().then(() => RECEPTION_SUMMARY)
}
