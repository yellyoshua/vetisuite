import { Suspense, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { Outlet, useLocation } from 'react-router'
import Icon from '@/components/legacy-ui/Icon'
import Tooltip from '@/components/legacy-ui/Tooltip'
import { PageLoading } from '@/components/PageState/PageState'
import { useSessionStore, type SessionProfile } from '@/stores/session.store'
import AccountMenu from './AccountMenu'
import Breadcrumbs from './Breadcrumbs'
import { findActiveEntry } from './navigation'
import Sidebar from './Sidebar'

const DESKTOP_QUERY = '(min-width: 64rem)'

function subscribeToDesktopQuery(onChange: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY)
  mediaQuery.addEventListener('change', onChange)

  return () => mediaQuery.removeEventListener('change', onChange)
}

function readIsDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches
}

export default function OwnerLayout() {
  const { pathname } = useLocation()
  const isDesktop = useSyncExternalStore(subscribeToDesktopQuery, readIsDesktop)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const profile = useSessionStore((state) => state.profile) as SessionProfile
  const accountUser = { name: [profile.firstName, profile.lastName].filter(Boolean).join(' '), roleLabel: 'Dueño' }
  const entry = findActiveEntry(pathname)
  const isDrawerVisible = isDesktop || isDrawerOpen
  const hasOverlay = isAccountOpen || (!isDesktop && isDrawerOpen)

  function closeOverlays() {
    setIsAccountOpen(false)
    setIsDrawerOpen(false)
  }

  function toggleAccount() {
    setIsDrawerOpen(false)
    setIsAccountOpen((current) => !current)
  }

  function closeOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && hasOverlay) {
      closeOverlays()
    }
  }

  return (
    <div
      onKeyDown={closeOnEscape}
      className="flex h-dvh w-full overflow-hidden bg-bg font-body text-ink"
    >
      <Sidebar
        activeEntry={entry}
        isCollapsed={isCollapsed}
        isDrawerOpen={isDrawerVisible}
        isInert={!isDrawerVisible}
        onToggleCollapsed={() => setIsCollapsed((current) => !current)}
        onNavigate={closeOverlays}
      />

      <div inert={!isDesktop && isDrawerOpen} className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-50 flex h-14 shrink-0 items-center gap-2.5 border-b border-line bg-card px-5">
          {!isDesktop && (
            <Tooltip content="Abrir menú">
              {(describedById) => (
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen((current) => !current)}
                  aria-label="Abrir menú"
                  aria-describedby={describedById}
                  aria-expanded={isDrawerOpen}
                  aria-controls="owner-sidebar"
                  className="flex size-[34px] cursor-pointer items-center justify-center rounded-control border-0 bg-transparent text-ink"
                >
                  <Icon name="menu" size={20} />
                </button>
              )}
            </Tooltip>
          )}
          <div className="ml-auto flex items-center gap-3">
            <AccountMenu
              user={accountUser}
              isOpen={isAccountOpen}
              onToggle={toggleAccount}
            />
          </div>
        </header>

        <Breadcrumbs pathname={pathname} activeEntry={entry} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="px-6 pt-6 pb-10">
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      {hasOverlay && (
        <div
          aria-hidden="true"
          onClick={closeOverlays}
          className={`fixed inset-0 z-[45] ${!isDesktop && isDrawerOpen ? 'bg-shade/55' : 'bg-transparent'}`}
        />
      )}
    </div>
  )
}
