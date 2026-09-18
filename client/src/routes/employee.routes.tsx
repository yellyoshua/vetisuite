import type { RouteObject } from 'react-router'
import ClientsPage from '@/modules/employee/clients/page'
import NewPatientPage from '@/modules/employee/clients-patients/page'

const employeeRoutes: RouteObject[] = [
  { path: '/clients', element: <ClientsPage /> },
  { path: '/clients/:clientId/patients/new', element: <NewPatientPage /> },
]

export default employeeRoutes
