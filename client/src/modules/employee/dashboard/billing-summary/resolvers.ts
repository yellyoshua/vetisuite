import dashboardBillingService from '@/modules/employee/dashboard/dashboard-billing.service'
import type { BillingSummary } from '../dashboard.schema'

export default {
  summary: async () => {
    const summary = await dashboardBillingService.get<BillingSummary>()

    return summary
  },
}
