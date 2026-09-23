import { ArrowLeftRightIcon, Building2Icon, CalendarClockIcon, CalendarDaysIcon, ClipboardListIcon, ConciergeBellIcon, FlaskConicalIcon, GlobeIcon, LayoutDashboardIcon, MegaphoneIcon, PackageIcon, ReceiptIcon, ScissorsIcon, SettingsIcon, ShieldCheckIcon, SlidersHorizontalIcon, StethoscopeIcon, UserCogIcon, UserRoundIcon, UsersIcon, WalletIcon, type LucideIcon } from 'lucide-react'

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
  icon: LucideIcon
}

export type Workspace = {
  id: WorkspaceId
  label: string
  icon: LucideIcon
  group: string
  entries: NavEntry[]
}

export const WORKSPACE_GROUPS = ['Entrada', 'Atención', 'Abastecimiento', 'Cierre', 'Soporte']

export const DEFAULT_WORKSPACE_ID: WorkspaceId = 'reception'

const SUMMARY_LABEL = 'Resumen'
const SUMMARY_ICON: LucideIcon = LayoutDashboardIcon

const CLIENTS_ENTRY: NavEntry = { label: 'Clientes y Pacientes', path: '/clients', icon: UsersIcon }

export const WORKSPACES: Workspace[] = [
  {
    id: 'marketing',
    label: 'Marketing',
    icon: MegaphoneIcon,
    group: 'Entrada',
    entries: [
      { label: SUMMARY_LABEL, path: '/marketing', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Portales', path: '/portals', icon: GlobeIcon },
      { label: 'Disponibilidad de la clínica', path: '/appointments-clinics', icon: SlidersHorizontalIcon },
    ],
  },
  {
    id: 'reception',
    label: 'Recepción',
    icon: ConciergeBellIcon,
    group: 'Entrada',
    entries: [
      { label: SUMMARY_LABEL, path: '/reception', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Citas', path: '/appointments', icon: CalendarDaysIcon },
      { label: 'Visitas', path: '/reception-visits', icon: ClipboardListIcon },
    ],
  },
  {
    id: 'care',
    label: 'Atención',
    icon: StethoscopeIcon,
    group: 'Atención',
    entries: [
      { label: SUMMARY_LABEL, path: '/care', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Visitas', path: '/visits', icon: ClipboardListIcon },
    ],
  },
  {
    id: 'grooming',
    label: 'Estética',
    icon: ScissorsIcon,
    group: 'Atención',
    entries: [
      { label: SUMMARY_LABEL, path: '/grooming-home', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Visitas', path: '/grooming-visits', icon: ClipboardListIcon },
      { label: 'Peluquería y Estética', path: '/grooming', icon: ScissorsIcon },
    ],
  },
  {
    id: 'laboratory',
    label: 'Laboratorio',
    icon: FlaskConicalIcon,
    group: 'Atención',
    entries: [
      { label: SUMMARY_LABEL, path: '/laboratory', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Visitas', path: '/lab-visits', icon: ClipboardListIcon },
      { label: 'Clínica y Laboratorio', path: '/clinic', icon: FlaskConicalIcon },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventario',
    icon: PackageIcon,
    group: 'Abastecimiento',
    entries: [
      { label: SUMMARY_LABEL, path: '/inventory-home', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Catálogo', path: '/inventory', icon: PackageIcon },
      { label: 'Lotes y caducidad', path: '/inventory-batches', icon: CalendarClockIcon },
      { label: 'Movimientos', path: '/inventory-moves', icon: ArrowLeftRightIcon },
    ],
  },
  {
    id: 'billing',
    label: 'Facturación',
    icon: ReceiptIcon,
    group: 'Cierre',
    entries: [
      { label: SUMMARY_LABEL, path: '/billing-home', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Cuentas y facturas', path: '/billing', icon: ReceiptIcon },
      { label: 'Finanzas', path: '/finance', icon: WalletIcon },
    ],
  },
  {
    id: 'administration',
    label: 'Administración',
    icon: Building2Icon,
    group: 'Soporte',
    entries: [
      { label: SUMMARY_LABEL, path: '/administration', icon: SUMMARY_ICON },
      CLIENTS_ENTRY,
      { label: 'Usuarios y roles', path: '/users', icon: UserCogIcon },
      { label: 'Configuración de la clínica', path: '/settings', icon: SettingsIcon },
    ],
  },
]

export const SUPERADMIN_DEFAULT_WORKSPACE_ID: WorkspaceId = 'administration'

export const SUPERADMIN_WORKSPACE_GROUPS = ['Administración']

export const SUPERADMIN_WORKSPACES: Workspace[] = [
  {
    id: 'administration',
    label: 'Administración',
    icon: Building2Icon,
    group: 'Administración',
    entries: [
      { label: 'Panel general', path: '/', icon: LayoutDashboardIcon },
      { label: 'Superadmins', path: '/superadmins', icon: ShieldCheckIcon },
      { label: 'Dueños', path: '/owners', icon: UsersIcon },
      { label: 'Perfil', path: '/profile', icon: UserRoundIcon },
    ],
  },
]

export const OWNER_DEFAULT_WORKSPACE_ID: WorkspaceId = 'administration'

export const OWNER_WORKSPACE_GROUPS = ['Administración']

export const OWNER_WORKSPACES: Workspace[] = [
  {
    id: 'administration',
    label: 'Administración',
    icon: Building2Icon,
    group: 'Administración',
    entries: [
      { label: 'Panel general', path: '/', icon: LayoutDashboardIcon },
      { label: 'Empleados', path: '/employees', icon: UsersIcon },
      { label: 'Perfil', path: '/profile', icon: UserRoundIcon },
    ],
  },
]
