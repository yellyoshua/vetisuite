import { lazy } from 'react'

export const DashboardPage = lazy(() => import('@/modules/superadmin/dashboard/page'))
export const DisabledAccountPage = lazy(() => import('@/modules/superadmin/disabled-account/page'))
export const PasswordEditPage = lazy(() => import('@/modules/superadmin/profile/password/password-edit/page'))
export const ProfileEditPage = lazy(() => import('@/modules/superadmin/profile/profile-edit/page'))
export const SessionsListPage = lazy(() => import('@/modules/superadmin/profile/sessions/sessions-list/page'))
