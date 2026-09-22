import type { RouteObject } from 'react-router'
import OauthCallback from '@/components/OauthCallback/OauthCallback'
import { EmailVerificationPage, RecoveryPasswordPage } from './public.pages'

const publicRoutes: RouteObject[] = [
  { path: '/oauth/vetisuite', element: <OauthCallback /> },
  { path: '/verify/email-verification', element: <EmailVerificationPage /> },
  { path: '/verify/recovery-password', element: <RecoveryPasswordPage /> },
]

export default publicRoutes
