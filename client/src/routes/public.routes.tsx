import type { RouteObject } from 'react-router'
import OauthCallback from '@/components/OauthCallback/OauthCallback'
import { appEnv } from '@/lib/environment'
import { EmailVerificationPage, RecoveryPasswordPage, UiCatalogPage } from './public.pages'

const publicRoutes: RouteObject[] = [
  { path: '/oauth/vetisuite', element: <OauthCallback /> },
  { path: '/verify/email-verification', element: <EmailVerificationPage /> },
  { path: '/verify/recovery-password', element: <RecoveryPasswordPage /> },
  ...(appEnv === 'development' ? [{ path: '/ui-catalog', element: <UiCatalogPage /> }] : []),
]

export default publicRoutes
