import dashboardLaboratoryService from '@/modules/employee/dashboard/dashboard-laboratory.service'
import type { LaboratorySummary } from '../dashboard.schema'

export default {
  summary: async () => {
    const summary = await dashboardLaboratoryService.get<LaboratorySummary>()

    return summary
  },
}
