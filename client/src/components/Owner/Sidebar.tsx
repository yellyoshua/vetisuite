import { Link } from 'react-router'
import Icon from '@/components/legacy-ui/Icon'
import Tooltip from '@/components/legacy-ui/Tooltip'
import type { NavEntry } from '@/constants/navigation'
import { OWNER_WORKSPACE } from './navigation'

type SidebarProps = {
  activeEntry: NavEntry | null
  isCollapsed: boolean
  isDrawerOpen: boolean
  isInert: boolean
  onToggleCollapsed: () => void
  onNavigate: () => void
}

function BrandMark() {
  return (
    <span className="flex size-[34px] shrink-0 items-center justify-center rounded-control bg-white/12 text-white">
      <Icon name="paw-print" size={18} />
    </span>
  )
}

type SidebarLinkProps = {
  entry: NavEntry
  isActive: boolean
  isCollapsed: boolean
  onNavigate: () => void
}

function SidebarLink({ entry, isActive, isCollapsed, onNavigate }: SidebarLinkProps) {
  const stateClassName = isActive ? 'bg-white/11 font-semibold text-white' : 'font-normal text-white/62'
  const layoutClassName = isCollapsed ? 'justify-center px-0 py-[11px]' : 'justify-start px-3 py-[9px]'

  return (
    <Tooltip content={entry.label} placement="right">
      {(describedById) => (
        <Link
          to={entry.path}
          onClick={onNavigate}
          aria-current={isActive ? 'page' : undefined}
          aria-label={isCollapsed ? entry.label : undefined}
          aria-describedby={describedById}
          className={`relative mb-1 flex w-full items-center gap-3 rounded-control text-left text-[13.5px] focus-visible:outline-white ${stateClassName} ${layoutClassName}`}
        >
          <Icon name={entry.icon} size={17} />
          {!isCollapsed && <span className="min-w-0 flex-1">{entry.label}</span>}
        </Link>
      )}
    </Tooltip>
  )
}

export default function Sidebar({
  activeEntry,
  isCollapsed,
  isDrawerOpen,
  isInert,
  onToggleCollapsed,
  onNavigate,
}: SidebarProps) {
  const collapseLabel = isCollapsed ? 'Expandir menú' : 'Minimizar menú'

  return (
    <aside
      id="owner-sidebar"
      inert={isInert}
      className={`fixed inset-y-0 left-0 z-[70] flex shrink-0 flex-col bg-dark text-white shadow-drawer transition-[width,transform] duration-200 ease-in-out motion-reduce:transition-none lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${isCollapsed ? 'w-[72px]' : 'w-[232px]'} ${isDrawerOpen ? 'translate-x-0' : '-translate-x-[102%]'}`}
    >
      {isCollapsed ? (
        <div className="flex items-center justify-center px-2 pt-6 pb-5">
          <BrandMark />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-5 pt-6 pb-5">
          <BrandMark />
          <div>
            <p className="font-head text-[15px] font-bold tracking-[-0.2px] text-white">Veti Suite</p>
            <p className="text-[10.5px] text-white/55">Sistema clínico integral</p>
          </div>
        </div>
      )}

      <nav aria-label={`Submódulos de ${OWNER_WORKSPACE.label}`} className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {OWNER_WORKSPACE.entries.map((entry) => (
          <SidebarLink
            key={entry.path}
            entry={entry}
            isActive={entry.path === activeEntry?.path}
            isCollapsed={isCollapsed}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <Tooltip content={collapseLabel} placement="right">
        {(describedById) => (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={isCollapsed ? collapseLabel : undefined}
            aria-describedby={describedById}
            aria-expanded={!isCollapsed}
            aria-controls="owner-sidebar"
            className={`mt-3 mb-5 flex cursor-pointer items-center justify-center gap-2 rounded-control border-0 bg-white/6 py-2.5 font-body text-[12.5px] text-white/65 focus-visible:outline-white ${isCollapsed ? 'mx-2' : 'mx-3'}`}
          >
            <Icon name={isCollapsed ? 'chevrons-right' : 'chevrons-left'} size={16} />
            {!isCollapsed && 'Minimizar'}
          </button>
        )}
      </Tooltip>
    </aside>
  )
}
