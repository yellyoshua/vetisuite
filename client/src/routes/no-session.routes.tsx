import { Navigate, type RouteObject } from 'react-router'
import { ResetPasswordPage, SignInPage, SignUpPage } from './public.pages'

const noSessionRoutes: RouteObject[] = [
  { index: true, element: <SignInPage /> },
  { path: '/sign-in', element: <SignInPage /> },
  { path: '/sign-up', element: <SignUpPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '*', element: <Navigate to="/sign-in" replace /> },
]

export default noSessionRoutes
