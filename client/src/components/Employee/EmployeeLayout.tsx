import { Suspense, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { Outlet, useLocation } from 'react-router'
import LoadingState from '@/components/LoadingState'
import Icon from '@/components/legacy-ui/Icon'
import Tooltip from '@/components/legacy-ui/Tooltip'
import type { Workspace } from '@/constants/navigation'
import useResolver from '@/hooks/legacy/use-resolver'
import ConfirmDialog from '@/modals/ConfirmDialog/confirm-dialog'
import useWorkspaceStore from '@/stores/workspace.store'
import { useSessionStore, type SessionProfile } from '@/stores/session.store'
import AccountMenu from './AccountMenu'
import Breadcrumbs from './Breadcrumbs'
import findActiveNavigation from './find-active-navigation'
import ModuleSwitcher from './ModuleSwitcher'
import resolveEmployeeLayout from './resolvers'
import Sidebar from './Sidebar'

type OpenMenu = 'modules' | 'account' | null

const DESKTOP_QUERY = '(min-width: 64rem)'

function subscribeToDesktopQuery(onChange: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY)
  mediaQuery.addEventListener('change', onChange)

  return () => mediaQuery.removeEventListener('change', onChange)
}

function readIsDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches
}

export default function EmployeeLayout() {
  const { pathname } = useLocation()
  const selectedWorkspaceId = useWorkspaceStore((state) => state.workspaceId)
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId)
  const isDesktop = useSyncExternalStore(subscribeToDesktopQuery, readIsDesktop)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const layout = useResolver(resolveEmployeeLayout, {})
  const profile = useSessionStore((state) => state.profile) as SessionProfile
  const accountUser = { name: [profile.firstName, profile.lastName].filter(Boolean).join(' '), roleLabel: 'Empleado' }
  const { workspace, entry } = findActiveNavigation(pathname, selectedWorkspaceId)
  const isDrawerVisible = isDesktop || isDrawerOpen
  const hasOverlay = openMenu !== null || (!isDesktop && isDrawerOpen)

  function closeOverlays() {
    setOpenMenu(null)
    setIsDrawerOpen(false)
  }

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setIsDrawerOpen(false)
    setOpenMenu((current) => (current === menu ? null : menu))
  }

  function selectWorkspace(nextWorkspace: Workspace) {
    setWorkspaceId(nextWorkspace.id)
    closeOverlays()
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
        workspace={workspace}
        activeEntry={entry}
        badgesByPath={layout.data?.openVisitCountsByPath ?? {}}
        isCollapsed={isCollapsed}
        isDrawerOpen={isDrawerVisible}
        isInert={!isDrawerVisible}
        onToggleCollapsed={() => setIsCollapsed((current) => !current)}
        onNavigate={() => selectWorkspace(workspace)}
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
                  aria-controls="staff-sidebar"
                  className="flex size-[34px] cursor-pointer items-center justify-center rounded-control border-0 bg-transparent text-ink"
                >
                  <Icon name="menu" size={20} />
                </button>
              )}
            </Tooltip>
          )}
          <div className="ml-auto flex items-center gap-3">
            <ModuleSwitcher
              activeWorkspaceId={workspace.id}
              isOpen={openMenu === 'modules'}
              onToggle={() => toggleMenu('modules')}
              onSelect={selectWorkspace}
            />
            {layout.error && (
              <p role="alert" className="text-xs text-red">
                {layout.error.message}
              </p>
            )}
            <AccountMenu
              user={accountUser}
              isOpen={openMenu === 'account'}
              onToggle={() => toggleMenu('account')}
            />
          </div>
        </header>

        <Breadcrumbs pathname={pathname} workspace={workspace} activeEntry={entry} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="px-6 pt-6 pb-10">
            <Suspense fallback={<LoadingState />}>
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

      <ConfirmDialog />
    </div>
  )
}
