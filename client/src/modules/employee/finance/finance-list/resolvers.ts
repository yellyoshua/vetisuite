import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import financeService from '@/modules/employee/finance/finance.service'
import type { FinanceReport } from '@/modules/employee/finance/finance.schema'

export default {
  report: (_params: Readonly<Params>, search: ResolverSearch) =>
    financeService.get<FinanceReport>({
      period: search.period ? String(search.period) : undefined,
      from: search.from ? String(search.from) : undefined,
      to: search.to ? String(search.to) : undefined,
      comparison: search.comparison ? String(search.comparison) : undefined,
    }),
}
