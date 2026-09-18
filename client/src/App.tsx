import { useRoutes, type RouteObject } from 'react-router'
import employeeRoutes from '@/routes/employee.routes'
import ownerRoutes from '@/routes/owner.routes'
import publicRoutes from '@/routes/public.routes'
import superadminRoutes from '@/routes/superadmin.routes'
import useSessionStore, { type SessionRole } from '@/stores/session.store'

const ROUTES_BY_ROLE: Record<SessionRole, RouteObject[]> = {
  superadmin: superadminRoutes,
  owner: ownerRoutes,
  employee: employeeRoutes,
  public: publicRoutes,
}

export default function App() {
  const role = useSessionStore((state) => state.role)

  return useRoutes(ROUTES_BY_ROLE[role])
}
