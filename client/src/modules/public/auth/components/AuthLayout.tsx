import type { ReactNode } from 'react'

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-dvh bg-gray-50 flex flex-col items-center justify-center gap-6 p-4 py-10">
      {children}
    </main>
  )
}
