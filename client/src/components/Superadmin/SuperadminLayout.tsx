import { Suspense, useState } from 'react'
import { Outlet } from 'react-router'
import { PageLoading } from '@/components/PageState/PageState'
import { useSessionStore, type SessionProfile } from '@/stores/session.store'
import Header from './Header'
import Sidebar from './Sidebar'

export default function SuperadminLayout() {
  const profile = useSessionStore((state) => state.profile) as SessionProfile
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} profile={profile} />
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {sidebarOpen &&
        <div
          role="presentation"
          aria-hidden="true"
          className="fixed inset-0 bg-gray-900/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      }
    </div>
  )
}
