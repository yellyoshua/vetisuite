import type { RouteObject } from 'react-router'
import SuperadminLayout from '@/components/Superadmin/SuperadminLayout'
import NotFoundScreen from '@/components/NotFoundScreen/NotFoundScreen'
import {
  DashboardPage,
  DisabledAccountPage,
  PasswordEditPage,
  ProfileEditPage,
  SessionsListPage,
} from './superadmin.pages'

const superadminRoutes: RouteObject[] = [
  {
    element: <SuperadminLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/profile', element: <ProfileEditPage /> },
      { path: '/profile/password', element: <PasswordEditPage /> },
      { path: '/profile/sessions', element: <SessionsListPage /> },
      { path: '/disabled-account', element: <DisabledAccountPage /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]

export default superadminRoutes
