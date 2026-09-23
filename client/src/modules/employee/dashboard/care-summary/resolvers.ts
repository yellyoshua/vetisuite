import dashboardCareService from '@/modules/employee/dashboard/dashboard-care.service'
import type { CareSummary } from '../dashboard.schema'

export default {
  summary: async () => {
    const summary = await dashboardCareService.get<CareSummary>()

    return summary
  },
}
