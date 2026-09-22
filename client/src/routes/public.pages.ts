import { lazy } from 'react'

export const EmailVerificationPage = lazy(() => import('@/modules/public/email-verification/page'))
export const RecoveryPasswordPage = lazy(() => import('@/modules/public/recovery-password/page'))
export const ResetPasswordPage = lazy(() => import('@/modules/public/auth/reset-password/page'))
export const SignInPage = lazy(() => import('@/modules/public/auth/sign-in/page'))
export const SignUpPage = lazy(() => import('@/modules/public/auth/sign-up/page'))
