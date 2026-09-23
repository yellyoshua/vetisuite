import dashboardReceptionService from '@/modules/employee/dashboard/dashboard-reception.service'
import type { ReceptionSummary } from '../dashboard.schema'

export default {
  summary: async () => {
    const summary = await dashboardReceptionService.get<ReceptionSummary>()

    return summary
  },
}
