import dashboardInventoryService from '@/modules/employee/dashboard/dashboard-inventory.service'
import type { InventorySummary } from '../dashboard.schema'

export default {
  summary: async () => {
    const summary = await dashboardInventoryService.get<InventorySummary>()

    return summary
  },
}
