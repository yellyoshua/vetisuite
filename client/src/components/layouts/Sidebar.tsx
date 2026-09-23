import { Link } from 'react-router'
import { ChevronsLeftIcon, ChevronsRightIcon, PawPrintIcon } from 'lucide-react'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import type { NavEntry, Workspace } from '@/constants/navigation'

export type SidebarProps = {
  workspace: Workspace
  activeEntry: NavEntry | null
  badgesByPath?: Record<string, number>
  isCollapsed: boolean
  isDrawerOpen: boolean
  isInert: boolean
  onToggleCollapsed: () => void
  onNavigate: () => void
  brandTitle?: string
  brandSubtitle?: string
}

type BrandMarkProps = {
  title: string
  subtitle: string
  isCollapsed: boolean
}

function BrandMark({ title, subtitle, isCollapsed }: BrandMarkProps) {
  const iconMark = (
    <span className="flex size-[34px] shrink-0 items-center justify-center rounded-control bg-white/12 text-white">
      <PawPrintIcon className="size-[18px]" aria-hidden="true" />
    </span>
  )

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center px-2 pt-6 pb-5">
        {iconMark}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-5 pt-6 pb-5">
      {iconMark}
      <div>
        <p className="font-head text-[15px] font-bold tracking-[-0.2px] text-white">{title}</p>
        <p className="text-[10.5px] text-white/55">{subtitle}</p>
      </div>
    </div>
  )
}

type SidebarLinkProps = {
  entry: NavEntry
  badge: number
  isActive: boolean
  isCollapsed: boolean
  onNavigate: () => void
}

function SidebarLink({ entry, badge, isActive, isCollapsed, onNavigate }: SidebarLinkProps) {
  const EntryIcon = entry.icon
  const stateClassName = isActive ? 'bg-white/11 font-semibold text-white' : 'font-normal text-white/62'
  const layoutClassName = isCollapsed ? 'justify-center px-0 py-[11px]' : 'justify-start px-3 py-[9px]'

  return (
    <CustomTooltip content={entry.label} side="right">
      <Link
          to={entry.path}
          onClick={onNavigate}
          aria-current={isActive ? 'page' : undefined}
          aria-label={isCollapsed ? entry.label : undefined}
          className={`relative mb-1 flex w-full items-center gap-3 rounded-control text-left text-[13.5px] focus-visible:outline-white ${stateClassName} ${layoutClassName}`}
        >
          <EntryIcon className="size-[17px]" aria-hidden="true" />
          {!isCollapsed && <span className="min-w-0 flex-1">{entry.label}</span>}
          {badge > 0 && !isCollapsed && (
            <span className="rounded-full bg-amber px-[7px] py-px text-[10px] font-bold text-white tabular-nums">
              {badge}
            </span>
          )}
          {badge > 0 && isCollapsed && (
            <span className="absolute top-[7px] right-3 size-2 rounded-full bg-amber">
              <span className="sr-only">{badge} abiertas</span>
            </span>
          )}
        </Link>
    </CustomTooltip>
  )
}

export default function Sidebar({
  workspace,
  activeEntry,
  badgesByPath = {},
  isCollapsed,
  isDrawerOpen,
  isInert,
  onToggleCollapsed,
  onNavigate,
  brandTitle = 'Veti Suite',
  brandSubtitle = 'Sistema clínico integral',
}: SidebarProps) {
  const collapseLabel = isCollapsed ? 'Expandir menú' : 'Minimizar menú'

  return (
    <aside
      id="staff-sidebar"
      inert={isInert}
      className={`fixed inset-y-0 left-0 z-[70] flex shrink-0 flex-col bg-dark text-white shadow-drawer transition-[width,transform] duration-200 ease-in-out motion-reduce:transition-none lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${isCollapsed ? 'w-[72px]' : 'w-[232px]'} ${isDrawerOpen ? 'translate-x-0' : '-translate-x-[102%]'}`}
    >
      <BrandMark title={brandTitle} subtitle={brandSubtitle} isCollapsed={isCollapsed} />

      <nav aria-label={`Submódulos de ${workspace.label}`} className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {workspace.entries.map((entry) => (
          <SidebarLink
            key={entry.path}
            entry={entry}
            badge={badgesByPath[entry.path] ?? 0}
            isActive={entry.path === activeEntry?.path}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <CustomTooltip content={collapseLabel} side="right">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? collapseLabel : undefined}
            aria-expanded={!isCollapsed}
            aria-controls="staff-sidebar"
            className={`mt-3 mb-5 flex cursor-pointer items-center justify-center gap-2 rounded-control border-0 bg-white/6 py-2.5 font-body text-[12.5px] text-white/65 focus-visible:outline-white ${isCollapsed ? 'mx-2' : 'mx-3'}`}
          >
            {isCollapsed ? <ChevronsRightIcon className="size-4" aria-hidden="true" /> : <ChevronsLeftIcon className="size-4" aria-hidden="true" />}
            {!isCollapsed && 'Minimizar'}
          </button>
      </CustomTooltip>
    </aside>
  )
}
