import { useSearchParams } from 'react-router'
import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { FINANCE_COMPARISON_VALUES, FINANCE_PERIOD_VALUES } from '@/constants/finance'
import useResolver from '@/hooks/use-resolver'
import { toIsoDate } from '@/lib/to-iso-date'
import type { FinanceComparison, FinancePeriod, FinanceQuery, FinanceQueryKey } from '../finance.schema'
import FinanceReportView from './components/FinanceReportView'
import PeriodBar from './components/PeriodBar'
import { resolveFinanceReport } from './resolvers'

const DEFAULT_PERIOD: FinancePeriod = 'month'

const DEFAULT_COMPARISON: FinanceComparison = 'previous-month'

function readFinanceQuery(searchParams: URLSearchParams, today: Date): FinanceQuery {
  return {
    period: FINANCE_PERIOD_VALUES.find((value) => value === searchParams.get('period')) ?? DEFAULT_PERIOD,
    from: searchParams.get('from') ?? toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: searchParams.get('to') ?? toIsoDate(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
    comparison: FINANCE_COMPARISON_VALUES.find((value) => value === searchParams.get('comparison')) ?? DEFAULT_COMPARISON,
  }
}

export default function FinanceListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = readFinanceQuery(searchParams, new Date())
  const { data, error, isLoading } = useResolver(resolveFinanceReport, query)

  function setQueryParam(key: FinanceQueryKey, value: string) {
    const isDate = key === 'from' || key === 'to'
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set(key, value)

        return next
      },
      { replace: isDate },
    )
  }

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Solo lectura: ingresos por área y por método, utilidad e IVA. Se calcula con las facturas emitidas."
        actions={
          <Button variant="ghost" isDisabled>
            <Icon name="download" size={14} /> Exportar
          </Button>
        }
      />
      <PeriodBar query={query} onChange={setQueryParam} />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && data.areas.length === 0 && (
        <EmptyState title="Sin facturas en el periodo" hint="Elige otro periodo o rango de fechas." />
      )}
      {data && data.areas.length > 0 && <FinanceReportView report={data} />}
    </>
  )
}
