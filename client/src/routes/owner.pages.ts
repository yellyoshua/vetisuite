import { lazy } from 'react'

export const DashboardPage = lazy(() => import('@/modules/owner/dashboard/page'))
export const DisabledAccountPage = lazy(() => import('@/modules/owner/disabled-account/page'))
export const PasswordEditPage = lazy(() => import('@/modules/owner/profile/password/password-edit/page'))
export const ProfileEditPage = lazy(() => import('@/modules/owner/profile/profile-edit/page'))
export const SessionsListPage = lazy(() => import('@/modules/owner/profile/sessions/sessions-list/page'))
export const EmployeesCreatePage = lazy(() => import('@/modules/owner/employees/employees-create/page'))
export const EmployeesEditPage = lazy(() => import('@/modules/owner/employees/employees-edit/page'))
export const EmployeesListPage = lazy(() => import('@/modules/owner/employees/employees-list/page'))
export const EmployeesPermissionsEditPage = lazy(() => import('@/modules/owner/employees/permissions/permissions-edit/page'))
