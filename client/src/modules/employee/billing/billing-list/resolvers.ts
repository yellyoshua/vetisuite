import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import billingService from '@/modules/employee/billing/billing.service'
import billingCountService from '@/modules/employee/billing/billing-count.service'
import type { BillingDocument } from '../billing.schema'

export default {
  documents: async (_params: Readonly<Params>, search: ResolverSearch) => {
    const [documents] = await Promise.all([
      billingService.get<BillingDocument[]>({
        search: search.search ? String(search.search) : undefined,
        status: search.status ? String(search.status) : undefined,
        preset: search.preset ? String(search.preset) : undefined,
        page: search.page,
      }),
      billingCountService.get<{ value: number }>({
        search: search.search ? String(search.search) : undefined,
        status: search.status ? String(search.status) : undefined,
        preset: search.preset ? String(search.preset) : undefined,
      }),
    ])

    return documents || []
  },
}
