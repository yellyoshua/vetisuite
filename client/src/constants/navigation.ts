import type { IconName } from '@/components/legacy-ui/Icon'

export type WorkspaceId =
  | 'marketing'
  | 'reception'
  | 'care'
  | 'grooming'
  | 'laboratory'
  | 'inventory'
  | 'billing'
  | 'administration'

export type NavEntry = {
  label: string
  path: string
  icon: IconName
}

export type Workspace = {
  id: WorkspaceId
  label: string
  icon: IconName
  group: string
  entries: NavEntry[]
}

export const WORKSPACE_GROUPS = ['Entrada', 'Atención', 'Abastecimiento', 'Cierre', 'Soporte']

export const DEFAULT_WORKSPACE_ID: WorkspaceId = 'reception'

const SUMMARY_LABEL = 'Resumen'
const SUMMARY_ICON: IconName = 'layout-dashboard'

const CLIENTS_ENTRY: NavEntry = { label: 'Clientes y Pacientes', path: '/clients', icon: 'users' }

export const WORKSPACES: Workspace[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'megaphone',
    group: 'Entrada',
    entries: [
      { label: SUMMARY_LABEL, path: '/marketing', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Portales', path: '/portals', icon: 'globe' },
      { label: 'Disponibilidad de la clínica', path: '/appointments-clinics', icon: 'sliders-horizontal' },
    ],
  },
  {
    id: 'reception',
    label: 'Recepción',
    icon: 'concierge-bell',
    group: 'Entrada',
    entries: [
      { label: SUMMARY_LABEL, path: '/reception', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Citas', path: '/appointments', icon: 'calendar-days' },
      { label: 'Visitas', path: '/reception-visits', icon: 'clipboard-list' },
    ],
  },
  {
    id: 'care',
    label: 'Atención',
    icon: 'stethoscope',
    group: 'Atención',
    entries: [
      { label: SUMMARY_LABEL, path: '/care', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Visitas', path: '/visits', icon: 'clipboard-list' },
    ],
  },
  {
    id: 'grooming',
    label: 'Estética',
    icon: 'scissors',
    group: 'Atención',
    entries: [
      { label: SUMMARY_LABEL, path: '/grooming-home', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Visitas', path: '/grooming-visits', icon: 'clipboard-list' },
      { label: 'Peluquería y Estética', path: '/grooming', icon: 'scissors' },
    ],
  },
  {
    id: 'laboratory',
    label: 'Laboratorio',
    icon: 'flask-conical',
    group: 'Atención',
    entries: [
      { label: SUMMARY_LABEL, path: '/laboratory', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Visitas', path: '/lab-visits', icon: 'clipboard-list' },
      { label: 'Clínica y Laboratorio', path: '/clinic', icon: 'flask-conical' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventario',
    icon: 'package',
    group: 'Abastecimiento',
    entries: [
      { label: SUMMARY_LABEL, path: '/inventory-home', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Catálogo', path: '/inventory', icon: 'package' },
      { label: 'Lotes y caducidad', path: '/inventory-batches', icon: 'calendar-clock' },
      { label: 'Movimientos', path: '/inventory-moves', icon: 'arrow-left-right' },
    ],
  },
  {
    id: 'billing',
    label: 'Facturación',
    icon: 'receipt',
    group: 'Cierre',
    entries: [
      { label: SUMMARY_LABEL, path: '/billing-home', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Cuentas y facturas', path: '/billing', icon: 'receipt' },
      { label: 'Finanzas', path: '/finance', icon: 'wallet' },
    ],
  },
  {
    id: 'administration',
    label: 'Administración',
    icon: 'building-2',
    group: 'Soporte',
    entries: [
      { label: SUMMARY_LABEL, path: '/administration', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Usuarios y roles', path: '/users', icon: 'user-cog' },
      { label: 'Configuración de la clínica', path: '/settings', icon: 'settings' },
    ],
  },
]
