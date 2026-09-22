import type { IconName } from '@/components/legacy-ui/Icon'

export const SETTINGS_SECTION_VALUES = ['clinic', 'billing', 'operations', 'notifications', 'security'] as const

export const SETTINGS_SECTION_LABELS: Record<(typeof SETTINGS_SECTION_VALUES)[number], string> = {
  clinic: 'Datos de la clínica',
  billing: 'Facturación',
  operations: 'Operación',
  notifications: 'Notificaciones',
  security: 'Seguridad',
}

export const SETTINGS_SECTION_ICONS: Record<(typeof SETTINGS_SECTION_VALUES)[number], IconName> = {
  clinic: 'building-2',
  billing: 'receipt',
  operations: 'workflow',
  notifications: 'bell',
  security: 'shield-check',
}

export const DEFAULT_SETTINGS_SECTION: (typeof SETTINGS_SECTION_VALUES)[number] = 'clinic'

export const SETTINGS_SECTION_PARAM = 'section'
