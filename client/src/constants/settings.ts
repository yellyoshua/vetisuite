import { BellIcon, Building2Icon, ReceiptIcon, ShieldCheckIcon, WorkflowIcon, type LucideIcon } from 'lucide-react'

export const SETTINGS_SECTION_VALUES = ['clinic', 'billing', 'operations', 'notifications', 'security'] as const

export const SETTINGS_SECTION_LABELS: Record<(typeof SETTINGS_SECTION_VALUES)[number], string> = {
  clinic: 'Datos de la clínica',
  billing: 'Facturación',
  operations: 'Operación',
  notifications: 'Notificaciones',
  security: 'Seguridad',
}

export const SETTINGS_SECTION_ICONS: Record<(typeof SETTINGS_SECTION_VALUES)[number], LucideIcon> = {
  clinic: Building2Icon,
  billing: ReceiptIcon,
  operations: WorkflowIcon,
  notifications: BellIcon,
  security: ShieldCheckIcon,
}

export const DEFAULT_SETTINGS_SECTION: (typeof SETTINGS_SECTION_VALUES)[number] = 'clinic'

export const SETTINGS_SECTION_PARAM = 'section'
