import { FINANCE_PERIOD_LABELS } from '@/constants/finance'
import type { FinanceQuery, FinanceReport } from '../finance.schema'

const FINANCE_REPORT: Omit<FinanceReport, 'periodLabel'> = {
  kpis: {
    income: { value: '$4 820', detail: 'mes en curso' },
    profit: { value: '$1 690', detail: '35% de margen' },
    vat: { value: '$578', detail: 'al 15%' },
    receivable: { value: '$57.50', detail: '2 clientes' },
  },
  areas: [
    { name: 'Consulta', invoiceCount: 14, amount: '$1 980', share: '41%', barPercent: 100, delta: '+6.2%', trend: 'up' },
    { name: 'Inventario', invoiceCount: 12, amount: '$1 425', share: '30%', barPercent: 72, delta: '+11.4%', trend: 'up' },
    { name: 'Estética', invoiceCount: 8, amount: '$930', share: '19%', barPercent: 47, delta: '−3.1%', trend: 'down' },
    { name: 'Laboratorio', invoiceCount: 4, amount: '$485', share: '10%', barPercent: 25, delta: '+2.8%', trend: 'up' },
  ],
  areaTotals: { invoiceCount: 38, amount: '$4 820', share: '100%', delta: '+8.4%', trend: 'up' },
  collectedTotal: '$4 820',
  paymentShares: [
    { method: 'cash', percent: 55 },
    { method: 'card', percent: 32 },
    { method: 'transfer', percent: 13 },
  ],
}

export function resolveFinanceReport({ period }: FinanceQuery): Promise<FinanceReport> {
  return Promise.resolve().then(() => ({
    ...FINANCE_REPORT,
    periodLabel: FINANCE_PERIOD_LABELS[period].toLowerCase(),
  }))
}
