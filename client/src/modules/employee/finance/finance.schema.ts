import {
  FINANCE_COMPARISON_VALUES,
  FINANCE_PAYMENT_METHOD_VALUES,
  FINANCE_PERIOD_VALUES,
  FINANCE_TREND_VALUES,
} from '@/constants/finance'

export type FinancePeriod = (typeof FINANCE_PERIOD_VALUES)[number]

export type FinanceComparison = (typeof FINANCE_COMPARISON_VALUES)[number]

export type FinancePaymentMethod = (typeof FINANCE_PAYMENT_METHOD_VALUES)[number]

export type FinanceTrend = (typeof FINANCE_TREND_VALUES)[number]

export type FinanceQuery = {
  period: FinancePeriod
  from: string
  to: string
  comparison: FinanceComparison
}

export type FinanceQueryKey = keyof FinanceQuery

export type FinanceKpiKey = 'income' | 'profit' | 'vat' | 'receivable'

export type FinanceKpi = {
  value: string
  detail: string
}

export type FinanceAreaTotals = {
  invoiceCount: number
  amount: string
  share: string
  delta: string
  trend: FinanceTrend
}

export type FinanceArea = FinanceAreaTotals & {
  name: string
  barPercent: number
}

export type FinancePaymentShare = {
  method: FinancePaymentMethod
  percent: number
}

export type FinanceReport = {
  periodLabel: string
  kpis: Record<FinanceKpiKey, FinanceKpi>
  areas: FinanceArea[]
  areaTotals: FinanceAreaTotals
  collectedTotal: string
  paymentShares: FinancePaymentShare[]
}
