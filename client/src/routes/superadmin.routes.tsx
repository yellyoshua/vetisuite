import type { RouteObject } from 'react-router'
import SuperadminLayout from '@/components/Superadmin/SuperadminLayout'
import NotFoundScreen from '@/components/NotFoundScreen/NotFoundScreen'
import {
  DashboardPage,
  DisabledAccountPage,
  OwnersCreatePage,
  OwnersEditPage,
  OwnersListPage,
  OwnersPermissionsEditPage,
  PasswordEditPage,
  ProfileEditPage,
  SessionsListPage,
  SuperadminsCreatePage,
  SuperadminsEditPage,
  SuperadminsListPage,
  SuperadminsPermissionsEditPage,
} from './superadmin.pages'

const superadminRoutes: RouteObject[] = [
  {
    element: <SuperadminLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/owners', element: <OwnersListPage /> },
      { path: '/owners/create', element: <OwnersCreatePage /> },
      { path: '/owners/:ownerId/edit', element: <OwnersEditPage /> },
      { path: '/owners/:ownerId/permissions', element: <OwnersPermissionsEditPage /> },
      { path: '/superadmins', element: <SuperadminsListPage /> },
      { path: '/superadmins/create', element: <SuperadminsCreatePage /> },
      { path: '/superadmins/:superadminId/edit', element: <SuperadminsEditPage /> },
      { path: '/superadmins/:superadminId/permissions', element: <SuperadminsPermissionsEditPage /> },
      { path: '/profile', element: <ProfileEditPage /> },
      { path: '/profile/password', element: <PasswordEditPage /> },
      { path: '/profile/sessions', element: <SessionsListPage /> },
      { path: '/disabled-account', element: <DisabledAccountPage /> },
      { path: '*', element: <NotFoundScreen /> },
    ],
  },
]

export default superadminRoutes
