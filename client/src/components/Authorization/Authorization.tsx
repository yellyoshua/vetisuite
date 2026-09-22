import type { ComponentType } from 'react'
import { Suspense } from 'react'
import { useRoutes, type RouteObject } from 'react-router'
import { useSessionStore, type SessionProfile, type SessionRole, type SessionUser } from '@/stores/session.store'
import DisabledAccount from '@/components/DisabledAccount/DisabledAccount'
import EmployeeLayout from '@/components/Employee/EmployeeLayout'
import OwnerLayout from '@/components/Owner/OwnerLayout'
import SuperadminLayout from '@/components/Superadmin/SuperadminLayout'
import { PageLoading } from '@/components/PageState/PageState'
import employeeRoutes from '@/routes/employee.routes'
import ownerRoutes from '@/routes/owner.routes'
import superadminRoutes from '@/routes/superadmin.routes'
import publicRoutes from '@/routes/public.routes'
import noSessionRoutes from '@/routes/no-session.routes'

const routesByRole: Record<SessionRole, RouteObject[]> = {
  employee: employeeRoutes,
  owner: ownerRoutes,
  superadmin: superadminRoutes,
}

const layoutsByRole: Record<SessionRole, ComponentType> = {
  employee: EmployeeLayout,
  owner: OwnerLayout,
  superadmin: SuperadminLayout,
}

export default function Authorization() {
  const profile = useSessionStore((state) => state.profile)

  const routes = resolveRoutes(profile)

  return <Suspense fallback={<PageLoading />}>{useRoutes([...publicRoutes, ...routes])}</Suspense>
}

function resolveRoutes(profile: SessionProfile | null): RouteObject[] {
  const role = profile?.user?.role
  const roleRoutes = role ? routesByRole[role] : undefined

  if (!profile || !role || !roleRoutes) {
    return noSessionRoutes
  }

  if (!isAccountBlocked(profile.user)) {
    return roleRoutes
  }

  const Layout = layoutsByRole[role]

  return [{
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DisabledAccount /> },
      { path: '*', element: <DisabledAccount /> },
    ],
  }]
}

function isAccountBlocked(user: SessionUser): boolean {
  if (user.disabled) {
    return true
  }

  return Boolean(user.bannedUntil && new Date(user.bannedUntil) > new Date())
}
