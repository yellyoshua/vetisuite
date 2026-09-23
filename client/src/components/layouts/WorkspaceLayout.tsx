import { Suspense, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { Outlet, useLocation } from 'react-router'
import { MenuIcon } from 'lucide-react'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import { PageLoading } from '@/components/PageState/PageState'
import {
  DEFAULT_WORKSPACE_ID,
  WORKSPACES,
  type Workspace,
  type WorkspaceId,
} from '@/constants/navigation'
import useResolver from '@/hooks/use-resolver'
import useWorkspaceStore from '@/stores/workspace.store'
import { useSessionStore, type SessionProfile, type SessionRole } from '@/stores/session.store'
import AccountMenu from './AccountMenu'
import Breadcrumbs from './Breadcrumbs'
import findActiveNavigation from './find-active-navigation'
import ModuleSwitcher from './ModuleSwitcher'
import Sidebar from './Sidebar'

type OpenMenu = 'modules' | 'account' | null

export type WorkspaceLayoutData = {
  openVisitCountsByPath?: Record<string, number>
}

export type WorkspaceLayoutProps = {
  workspaces?: Workspace[]
  defaultWorkspaceId?: WorkspaceId
  workspaceGroups?: string[]
  roleLabel?: string
  resolveData?: () => Promise<WorkspaceLayoutData>
  brandTitle?: string
  brandSubtitle?: string
}

const DESKTOP_QUERY = '(min-width: 64rem)'

const DEFAULT_RESOLVE_DATA = (): Promise<WorkspaceLayoutData> => Promise.resolve({ openVisitCountsByPath: {} })

const ROLE_LABELS: Record<SessionRole, string> = {
  employee: 'Empleado',
  owner: 'Dueño',
  superadmin: 'Superadministrador',
}

function subscribeToDesktopQuery(onChange: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY)
  mediaQuery.addEventListener('change', onChange)

  return () => mediaQuery.removeEventListener('change', onChange)
}

function readIsDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches
}

export default function WorkspaceLayout({
  workspaces = WORKSPACES,
  defaultWorkspaceId = DEFAULT_WORKSPACE_ID,
  workspaceGroups,
  roleLabel,
  resolveData = DEFAULT_RESOLVE_DATA,
  brandTitle,
  brandSubtitle,
}: WorkspaceLayoutProps) {
  const { pathname } = useLocation()
  const selectedWorkspaceId = useWorkspaceStore((state) => state.workspaceId)
  const setWorkspaceId = useWorkspaceStore((state) => state.setWorkspaceId)
  const isDesktop = useSyncExternalStore(subscribeToDesktopQuery, readIsDesktop)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)
  const layout = useResolver({ layout: resolveData })
  const profile = useSessionStore((state) => state.profile) as SessionProfile
  const resolvedRoleLabel = roleLabel ?? (profile?.user?.role ? ROLE_LABELS[profile.user.role] : 'Usuario')
  const accountUser = {
    name: [profile?.firstName, profile?.lastName].filter(Boolean).join(' '),
    roleLabel: resolvedRoleLabel,
  }
  const { workspace, entry } = findActiveNavigation(pathname, selectedWorkspaceId || defaultWorkspaceId, workspaces)
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
        badgesByPath={layout.data.layout?.openVisitCountsByPath ?? {}}
        isCollapsed={isCollapsed}
        isDrawerOpen={isDrawerVisible}
        isInert={!isDrawerVisible}
        onToggleCollapsed={() => setIsCollapsed((current) => !current)}
        onNavigate={() => selectWorkspace(workspace)}
        brandTitle={brandTitle}
        brandSubtitle={brandSubtitle}
      />

      <div inert={!isDesktop && isDrawerOpen} className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="relative z-50 flex h-14 shrink-0 items-center gap-2.5 border-b border-line bg-card px-5">
          {!isDesktop && (
            <CustomTooltip content="Abrir menú">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen((current) => !current)}
                  aria-label="Abrir menú"
                  aria-expanded={isDrawerOpen}
                  aria-controls="staff-sidebar"
                  className="flex size-[34px] cursor-pointer items-center justify-center rounded-control border-0 bg-transparent text-ink"
                >
                  <MenuIcon className="size-5" aria-hidden="true" />
                </button>
            </CustomTooltip>
          )}
          <div className="ml-auto flex items-center gap-3">
            <ModuleSwitcher
              workspaces={workspaces}
              groups={workspaceGroups}
              activeWorkspaceId={workspace.id}
              isOpen={openMenu === 'modules'}
              onToggle={() => toggleMenu('modules')}
              onSelect={selectWorkspace}
            />
            {layout.error && (
              <p role="alert" className="text-xs text-red">
                {layout.error}
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
