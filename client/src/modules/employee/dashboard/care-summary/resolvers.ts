import type { CareSummary } from '../dashboard.schema'

const CARE_SUMMARY: CareSummary = {
  kpis: {
    waiting: { value: '2', detail: 'pacientes en sala' },
    inConsultation: { value: '1', detail: 'atendiéndose ahora' },
    dischargedToday: { value: '1', detail: 'consulta cerrada' },
    averageTime: { value: '34 min', detail: 'por consulta' },
  },
  panels: {
    ongoingConsultations: {
      meta: 'hoy',
      items: [
        { name: 'Kiwi · Elena Buitrón', detail: 'Consulta general · Dra. María Torres', badge: 'en consulta', tone: 'blue' },
        { name: 'Rocky · Marco Salazar', detail: 'Control dermatológico · Dr. Andrés Vela', badge: 'en espera', tone: 'amber' },
        { name: 'Simba · Paula Andrade', detail: 'Desparasitación · Dra. María Torres', badge: 'en espera', tone: 'amber' },
      ],
    },
    referrals: {
      meta: 'hoy',
      items: [
        { name: 'Rocky · Hemograma completo', detail: 'derivado a Laboratorio · Lab. externo', badge: 'solicitado', tone: 'amber' },
        { name: 'Kiwi · Perfil renal', detail: 'derivado a Laboratorio · Lab. interno', badge: 'en análisis', tone: 'blue' },
        { name: 'Luna · Baño completo', detail: 'derivado a Estética · Sofía Mena', badge: 'pendiente', tone: 'amber' },
        { name: 'Max · Vacunación anual', detail: 'alta dada · listo para facturar', badge: 'finalizado', tone: 'green' },
      ],
    },
  },
}

export function resolveCareSummary(): Promise<CareSummary> {
  return Promise.resolve().then(() => CARE_SUMMARY)
}
