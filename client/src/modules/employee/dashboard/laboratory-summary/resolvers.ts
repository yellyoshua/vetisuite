import type { LaboratorySummary } from '../dashboard.schema'

const LABORATORY_SUMMARY: LaboratorySummary = {
  kpis: {
    openOrders: { value: '2', detail: 'una externa, una interna' },
    inAnalysis: { value: '1', detail: 'muestra procesándose' },
    todayResults: { value: '1', detail: 'listo para el médico' },
    averageTurnaround: { value: '6 h 20 min', detail: 'de la orden al resultado' },
  },
  panels: {
    pendingOrders: {
      meta: 'hoy',
      items: [
        { name: 'Rocky · Hemograma completo', detail: 'Lab. externo · pedido 10:20', badge: 'solicitado', tone: 'amber' },
        { name: 'Kiwi · Perfil renal', detail: 'Lab. interno · pedido 09:40', badge: 'en análisis', tone: 'blue' },
        { name: 'Max · Coproparasitario', detail: 'Lab. interno · pedido 09:05', badge: 'con resultado', tone: 'green' },
      ],
    },
    topExams: {
      meta: 'últimos 30 días',
      items: [
        { name: 'Hemograma completo', detail: '31 órdenes · 68% internas', badge: '31', tone: 'green' },
        { name: 'Coproparasitario', detail: '24 órdenes · 100% internas', badge: '24', tone: 'green' },
        { name: 'Perfil renal', detail: '13 órdenes · 54% externas', badge: '13', tone: 'blue' },
        { name: 'Citología cutánea', detail: '7 órdenes · externas', badge: '7', tone: 'gray' },
      ],
    },
  },
}

export function resolveLaboratorySummary(): Promise<LaboratorySummary> {
  return Promise.resolve().then(() => LABORATORY_SUMMARY)
}
