import type {
  AdministrationSummary,
  BillingSummary,
  CareSummary,
  GroomingSummary,
  InventorySummary,
  LaboratorySummary,
  MarketingSummary,
  ReceptionSummary,
} from './dashboard.schema'

const dashboardService = {
  receptionSummary(): Promise<ReceptionSummary> {
    throw new Error('Not implemented: dashboardService.receptionSummary')
  },
  marketingSummary(): Promise<MarketingSummary> {
    throw new Error('Not implemented: dashboardService.marketingSummary')
  },
  careSummary(): Promise<CareSummary> {
    throw new Error('Not implemented: dashboardService.careSummary')
  },
  groomingSummary(): Promise<GroomingSummary> {
    throw new Error('Not implemented: dashboardService.groomingSummary')
  },
  laboratorySummary(): Promise<LaboratorySummary> {
    throw new Error('Not implemented: dashboardService.laboratorySummary')
  },
  inventorySummary(): Promise<InventorySummary> {
    throw new Error('Not implemented: dashboardService.inventorySummary')
  },
  billingSummary(): Promise<BillingSummary> {
    throw new Error('Not implemented: dashboardService.billingSummary')
  },
  administrationSummary(): Promise<AdministrationSummary> {
    throw new Error('Not implemented: dashboardService.administrationSummary')
  },
}

export default dashboardService
