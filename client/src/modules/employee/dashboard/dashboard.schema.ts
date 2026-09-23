import type { DonutSegment } from '@/components/DonutChart/DonutChart'
import type { BadgeTone } from '@/constants/badge-tones'

export type KpiValue = {
  value: string
  detail: string
}

export type DailyBar = {
  label: string
  value: number
  isToday: boolean
}

export type DonutSummary = {
  total: string
  segments: DonutSegment[]
}

export type ListPanelItem = {
  name: string
  detail: string
  badge: string
  tone: BadgeTone
}

export type ListPanelData = {
  meta: string
  items: ListPanelItem[]
}

type ListSummary<TKpiKey extends string, TPanelKey extends string> = {
  kpis: Record<TKpiKey, KpiValue>
  panels: Record<TPanelKey, ListPanelData>
}

export type ReceptionKpiKey = 'todayAppointments' | 'confirmed' | 'pending' | 'attendance'

export type DemandHour = {
  label: string
  value: number
  percent: number
}

export type AgendaEntry = {
  id: string
  time: string
  patientName: string
  ownerName: string
  detail: string
  status: string
  tone: BadgeTone
}

export type ReceptionSummary = {
  kpis: Record<ReceptionKpiKey, KpiValue>
  dailyAppointments: DailyBar[]
  todayStatuses: DonutSummary & { cancelledOrNoShow: string }
  demandHours: DemandHour[]
  agenda: AgendaEntry[]
}

export type MarketingKpiKey = 'onlineBookings' | 'newClients'

export type FunnelStepKey = 'booked' | 'attended'

export type FunnelStep = {
  value: string
  share: string
  percent: number
}

export type PortalPerformance = {
  name: string
  status: string
  tone: BadgeTone
  detail: string
  percent: number
}

export type MarketingSummary = {
  kpis: Record<MarketingKpiKey, KpiValue>
  bookingOrigins: DonutSummary
  portalPerformance: PortalPerformance[]
  funnel: Record<FunnelStepKey, FunnelStep>
}

export type CareKpiKey = 'waiting' | 'inConsultation' | 'dischargedToday'

export type CarePanelKey = 'ongoingConsultations' | 'referrals'

export type CareSummary = ListSummary<CareKpiKey, CarePanelKey>

export type GroomingKpiKey = 'todayServices' | 'inProgress' | 'finished' | 'averageTicket'

export type GroomingPanelKey = 'groomingRoom' | 'topServices'

export type GroomingSummary = ListSummary<GroomingKpiKey, GroomingPanelKey>

export type LaboratoryKpiKey = 'openOrders' | 'inAnalysis' | 'todayResults'

export type LaboratoryPanelKey = 'pendingOrders' | 'topExams'

export type LaboratorySummary = ListSummary<LaboratoryKpiKey, LaboratoryPanelKey>

export type InventoryKpiKey = 'stockAlerts' | 'inventoryValue'

export type InventoryPanelKey = 'stockAlerts' | 'consumptionByArea'

export type InventorySummary = ListSummary<InventoryKpiKey, InventoryPanelKey>

export type BillingKpiKey = 'todayRevenue' | 'openAccounts' | 'receivables' | 'averageTicket'

export type BillingPanelKey = 'accountsToClose' | 'pendingCollections'

export type BillingSummary = ListSummary<BillingKpiKey, BillingPanelKey>

export type AdministrationKpiKey = 'activeUsers' | 'roles' | 'todayLogins' | 'enabledModules'

export type AdministrationPanelKey = 'rolePermissions' | 'recentLogins'

export type AdministrationSummary = ListSummary<AdministrationKpiKey, AdministrationPanelKey>
