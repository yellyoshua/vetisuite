import dashboardGroomingService from '@/modules/employee/dashboard/dashboard-grooming.service'
import type { GroomingSummary } from '../dashboard.schema'

export default {
  summary: async () => {
    const summary = await dashboardGroomingService.get<GroomingSummary>()

    return summary
  },
}
