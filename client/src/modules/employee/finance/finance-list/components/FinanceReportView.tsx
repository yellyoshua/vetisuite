import KpiCard, { type KpiTone } from '@/components/KpiCard'
import KpiGrid from '@/components/KpiGrid'
import type { IconName } from '@/components/legacy-ui/Icon'
import type { FinanceKpiKey, FinanceReport } from '../../finance.schema'
import AreaDetailCard from './AreaDetailCard'
import AreaIncomeCard from './AreaIncomeCard'
import PaymentMethodsCard from './PaymentMethodsCard'

type FinanceReportViewProps = {
  report: FinanceReport
}

type KpiCardDefinition = {
  metric: FinanceKpiKey
  label: string
  icon: IconName
  tone: KpiTone
}

const KPI_CARDS: KpiCardDefinition[] = [
  { metric: 'income', label: 'Ingresos del mes', icon: 'wallet', tone: 'green' },
  { metric: 'profit', label: 'Utilidad', icon: 'trending-up', tone: 'green' },
  { metric: 'vat', label: 'IVA por declarar', icon: 'percent', tone: 'amber' },
  { metric: 'receivable', label: 'Por cobrar', icon: 'circle-alert', tone: 'red' },
]

export default function FinanceReportView({ report }: FinanceReportViewProps) {
  return (
    <>
      <KpiGrid>
        {KPI_CARDS.map((card) => (
          <KpiCard
            key={card.metric}
            label={card.label}
            value={report.kpis[card.metric].value}
            detail={report.kpis[card.metric].detail}
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
