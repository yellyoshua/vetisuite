import dashboardMarketingService from '@/modules/employee/dashboard/dashboard-marketing.service'
import type { MarketingSummary } from '../dashboard.schema'

export default {
  summary: async () => {
    const summary = await dashboardMarketingService.get<MarketingSummary>()

    return summary
  },
}
