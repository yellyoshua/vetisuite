import type { NavEntry, Workspace } from '@/constants/navigation'

export const OWNER_ENTRIES: NavEntry[] = [
  { label: 'Panel general', path: '/', icon: 'layout-dashboard' },
  { label: 'Empleados', path: '/employees', icon: 'users' },
  { label: 'Perfil', path: '/profile', icon: 'user-round' },
]

export const OWNER_WORKSPACE: Omit<Workspace, 'id'> = {
  label: 'Administración',
  icon: 'building-2',
  group: 'Soporte',
  entries: OWNER_ENTRIES,
}

export function findActiveEntry(pathname: string): NavEntry | null {
  const [summary, ...sections] = OWNER_ENTRIES
  const section = sections.find((entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`))

  if (section) {
    return section
  }

  return pathname === summary.path ? summary : null
}
