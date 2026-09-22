import type { RouteObject } from 'react-router'
import OwnerLayout from '@/components/Owner/OwnerLayout'
import NotFoundScreen from '@/components/NotFoundScreen/NotFoundScreen'
import {
  DashboardPage,
  DisabledAccountPage,
  PasswordEditPage,
  ProfileEditPage,
  SessionsListPage,
} from './owner.pages'

const ownerRoutes: RouteObject[] = [
  {
    element: <OwnerLayout />,
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

export default ownerRoutes
