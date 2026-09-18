import type { FinanceQuery, FinanceReport } from './finance.schema'

const financeService = {
  report(_query: FinanceQuery): Promise<FinanceReport> {
    throw new Error('Not implemented: financeService.report')
  },
}

export default financeService
