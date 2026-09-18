import { Link } from 'react-router'
import Icon from '@/components/ui/Icon'
import Tooltip from '@/components/ui/Tooltip'
import { WORKSPACE_GROUPS, WORKSPACES, type Workspace, type WorkspaceId } from '@/constants/navigation'

type ModuleSwitcherProps = {
  activeWorkspaceId: WorkspaceId
  isOpen: boolean
  onToggle: () => void
  onSelect: (workspace: Workspace) => void
}

const MENU_ID = 'module-switcher-menu'

export default function ModuleSwitcher({ activeWorkspaceId, isOpen, onToggle, onSelect }: ModuleSwitcherProps) {
  return (
    <div className="relative">
      <Tooltip content="Módulos">
        {(describedById) => (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Cambiar de módulo"
            aria-describedby={describedById}
            aria-expanded={isOpen}
            aria-controls={MENU_ID}
            className={`flex size-[34px] cursor-pointer items-center justify-center rounded-control border ${isOpen ? 'border-transparent bg-green-soft text-green' : 'border-line bg-card text-ink'}`}
          >
            <Icon name="layout-grid" size={17} />
          </button>
        )}
      </Tooltip>
      {isOpen && (
        <div
          id={MENU_ID}
          className="absolute top-[calc(100%+8px)] right-0 max-h-[calc(100dvh-76px)] w-[302px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-card border border-line bg-card p-1.5 shadow-menu"
        >
          {WORKSPACE_GROUPS.map((group) => (
            <section key={group} aria-labelledby={`${MENU_ID}-${group}`}>
              <div className="flex items-center gap-2 px-2.5 pt-2 pb-1.5">
                <h2 id={`${MENU_ID}-${group}`} className="text-[11px] font-semibold tracking-[0.3px] text-sub uppercase">
                  {group}
                </h2>
                <span aria-hidden="true" className="h-px flex-1 bg-line-soft" />
              </div>
              {WORKSPACES.filter((workspace) => workspace.group === group).map((workspace) => {
                const isActive = workspace.id === activeWorkspaceId

                return (
                  <Link
                    key={workspace.id}
                    to={workspace.entries[0].path}
                    onClick={() => onSelect(workspace)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`mb-0.5 flex w-full items-center gap-2.5 rounded-control p-2.5 text-left ${isActive ? 'bg-green-soft text-green' : 'text-ink'}`}
                  >
                    <span className={isActive ? 'text-green' : 'text-sub'}>
                      <Icon name={workspace.icon} size={17} />
                    </span>
                    <span className={`min-w-0 flex-1 text-[13.5px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                      {workspace.label}
                    </span>
                    {isActive && (
                      <span className="text-green">
                        <Icon name="check" size={15} />
                      </span>
                    )}
                  </Link>
                )
              })}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
