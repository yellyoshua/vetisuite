import { DownloadIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import EmptyState from '@/components/EmptyState/EmptyState'
import { Button } from '@/components/ui/button'
import { DEFAULT_FINANCE_COMPARISON, DEFAULT_FINANCE_PERIOD, FINANCE_COMPARISON_VALUES, FINANCE_PERIOD_VALUES } from '@/constants/finance'
import { toIsoDate } from '@/lib/to-iso-date'
import type { FinanceQuery, FinanceReport } from '@/modules/employee/finance/finance.schema'
import FinanceReportView from './FinanceReportView'
import PeriodBar from './PeriodBar'

type FinanceProps = {
  report: FinanceReport
}

function readFinanceQuery(query: Record<string, string>, today: Date): FinanceQuery {
  return {
    period: FINANCE_PERIOD_VALUES.find((value) => value === query.period) ?? DEFAULT_FINANCE_PERIOD,
    from: query.from ?? toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: query.to ?? toIsoDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
    comparison: FINANCE_COMPARISON_VALUES.find((value) => value === query.comparison) ?? DEFAULT_FINANCE_COMPARISON,
  }
}

export default function Finance({ report }: FinanceProps) {
  const { changeQuery, query } = useQueryParams()
  const financeQuery = readFinanceQuery(query, new Date())

  return (
    <CustomPage
      title="Finanzas"
      description="Solo lectura: ingresos por área y por método, utilidad e IVA. Se calcula con las facturas emitidas."
      actions={
        <Button variant="ghost" disabled>
          <DownloadIcon /> Exportar
        </Button>
      }
    >
      <CustomPageContainer>
        <PeriodBar query={financeQuery} onChange={(key, value) => changeQuery({ [key]: value })} />
      </CustomPageContainer>
      {report.areas.length === 0 && (
        <EmptyState title="Sin facturas en el periodo" hint="Elige otro periodo o rango de fechas." />
      )}
      {report.areas.length > 0 && <FinanceReportView report={report} />}
    </CustomPage>
  )
}
