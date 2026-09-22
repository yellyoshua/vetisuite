import { lazy } from 'react'

export const DashboardPage = lazy(() => import('@/modules/owner/dashboard/page'))
export const DisabledAccountPage = lazy(() => import('@/modules/owner/disabled-account/page'))
export const PasswordEditPage = lazy(() => import('@/modules/owner/profile/password/password-edit/page'))
export const ProfileEditPage = lazy(() => import('@/modules/owner/profile/profile-edit/page'))
export const SessionsListPage = lazy(() => import('@/modules/owner/profile/sessions/sessions-list/page'))
