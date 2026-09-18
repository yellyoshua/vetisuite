import type { BillingSummary } from '../dashboard.schema'

const BILLING_SUMMARY: BillingSummary = {
  kpis: {
    todayRevenue: { value: '$0.00', detail: '0 facturas emitidas' },
    openAccounts: { value: '2', detail: '$77.00 sin facturar' },
    receivables: { value: '$57.50', detail: '2 clientes' },
    averageTicket: { value: '$33.60', detail: 'últimos 30 días' },
  },
  panels: {
    accountsToClose: {
      meta: 'hoy',
      items: [
        { name: 'Elena Buitrón', detail: 'Cuenta #1042 · 3 cargos · $47.00', badge: 'abierta', tone: 'amber' },
        { name: 'Carolina Ríos', detail: 'Cuenta #1041 · 2 cargos · $30.00', badge: 'abierta', tone: 'amber' },
        { name: 'Andrés Lema', detail: 'Baño medicado · $18.00 · sin cuenta', badge: 'por cargar', tone: 'blue' },
      ],
    },
    pendingCollections: {
      meta: '2 clientes',
      items: [
        { name: 'Marco Salazar', detail: 'Factura 001-0318 · vence en 4 días', badge: 'por cobrar', tone: 'red' },
        { name: 'Paula Andrade', detail: 'Factura 001-0312 · vencida hace 9 días', badge: 'por cobrar', tone: 'red' },
        { name: 'Jorge Paredes', detail: 'Factura 001-0317 · $28.00', badge: 'pagada', tone: 'green' },
      ],
    },
  },
}

export function resolveBillingSummary(): Promise<BillingSummary> {
  return Promise.resolve().then(() => BILLING_SUMMARY)
}
