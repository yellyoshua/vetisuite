import dashboardAdministrationService from '@/modules/employee/dashboard/dashboard-administration.service'
import type { AdministrationSummary } from '../dashboard.schema'

export default {
  summary: async () => {
    const summary = await dashboardAdministrationService.get<AdministrationSummary>()

    return summary
  },
}
