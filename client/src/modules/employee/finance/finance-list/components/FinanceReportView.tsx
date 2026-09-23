import { CircleAlertIcon, PercentIcon, TrendingUpIcon, WalletIcon, type LucideIcon } from 'lucide-react'
import KpiCard, { type KpiTone } from '@/components/KpiCard/KpiCard'
import KpiGrid from '@/components/KpiGrid/KpiGrid'
import { formatCurrency } from '@/lib/format-currency'
import type { FinanceKpi, FinanceKpiKey, FinanceReport } from '@/modules/employee/finance/finance.schema'
import AreaDetailCard from './AreaDetailCard'
import AreaIncomeCard from './AreaIncomeCard'
import PaymentMethodsCard from './PaymentMethodsCard'

type FinanceReportViewProps = {
  report: FinanceReport
}

type KpiCardDefinition = {
  metric: FinanceKpiKey
  label: string
  icon: LucideIcon
  tone: KpiTone
}

const KPI_CARDS: KpiCardDefinition[] = [
  { metric: 'income', label: 'Ingresos del mes', icon: WalletIcon, tone: 'green' },
  { metric: 'profit', label: 'Utilidad', icon: TrendingUpIcon, tone: 'green' },
  { metric: 'vat', label: 'IVA por declarar', icon: PercentIcon, tone: 'amber' },
  { metric: 'receivable', label: 'Por cobrar', icon: CircleAlertIcon, tone: 'red' },
]

function formatKpiDetail(metric: FinanceKpiKey, kpi: FinanceKpi, periodLabel: string): string {
  if (metric === 'income') {
    return periodLabel
  }
  if (metric === 'profit') {
    return `${kpi.margin ?? 0}% de margen`
  }
  if (metric === 'vat') {
    return `al ${kpi.rate ?? 0}%`
  }
  if (metric === 'receivable') {
    const count = kpi.count ?? 0

    return `${count} ${count === 1 ? 'cliente' : 'clientes'}`
  }

  return ''
}

export default function FinanceReportView({ report }: FinanceReportViewProps) {
  return (
    <>
      <KpiGrid>
        {KPI_CARDS.map((card) => (
          <KpiCard
            key={card.metric}
            label={card.label}
            value={formatCurrency(report.kpis[card.metric].value)}
            detail={formatKpiDetail(card.metric, report.kpis[card.metric], report.periodLabel)}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </KpiGrid>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-3.5">
        <AreaIncomeCard areas={report.areas} periodLabel={report.periodLabel} />
        <PaymentMethodsCard collectedTotal={report.collectedTotal} paymentShares={report.paymentShares} />
      </div>
      <AreaDetailCard areas={report.areas} totals={report.areaTotals} />
    </>
  )
}
