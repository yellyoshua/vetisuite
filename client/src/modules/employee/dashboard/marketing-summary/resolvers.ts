import type { MarketingSummary } from '../dashboard.schema'

const MARKETING_SUMMARY: MarketingSummary = {
  kpis: {
    portalVisits: { value: '1 860', detail: 'últimos 30 días · +14%' },
    onlineBookings: { value: '54', detail: '42% de todas las reservas' },
    portalConversion: { value: '2.9%', detail: 'visita que termina en cita' },
    newClients: { value: '18', detail: 'llegaron por el portal' },
  },
  portalVisits: [
    { label: 'lun', value: 58, isToday: false },
    { label: 'mar', value: 74, isToday: false },
    { label: 'mié', value: 61, isToday: false },
    { label: 'jue', value: 82, isToday: false },
    { label: 'vie', value: 96, isToday: false },
    { label: 'sáb', value: 71, isToday: false },
    { label: 'hoy', value: 43, isToday: true },
  ],
  appointmentsPerHundredVisits: 3,
  bookingOrigins: {
    total: '128',
    segments: [
      { label: 'Portal de reservas', value: '54', percent: 42, tone: 'green' },
      { label: 'Recepción', value: '42', percent: 33, tone: 'blue' },
      { label: 'Teléfono', value: '22', percent: 17, tone: 'amber' },
      { label: 'Campaña de vacunación', value: '10', percent: 8, tone: 'track' },
    ],
  },
  portalPerformance: [
    { name: 'Reserva en línea', status: 'activo', tone: 'green', detail: '612 visitas · 54 citas', percent: 100 },
    { name: 'Portal de la clínica', status: 'activo', tone: 'green', detail: '1 248 visitas · 37 citas', percent: 69 },
    { name: 'Campaña de vacunación', status: 'borrador', tone: 'gray', detail: 'sin publicar', percent: 0 },
  ],
  funnel: {
    visits: { value: '1 860', share: '100%', percent: 100 },
    formOpened: { value: '412', share: '22%', percent: 22 },
    booked: { value: '54', share: '2.9%', percent: 13 },
    attended: { value: '47', share: '2.5%', percent: 11 },
  },
}

export function resolveMarketingSummary(): Promise<MarketingSummary> {
  return Promise.resolve().then(() => MARKETING_SUMMARY)
}
