import type { ListPage } from '@/hooks/use-list-query'
import type { BillingDocument, BillingListQuery } from './billing.schema'

const billingService = {
  list(_query: BillingListQuery): Promise<ListPage<BillingDocument>> {
    throw new Error('Not implemented: billingService.list')
  },
}

export default billingService
