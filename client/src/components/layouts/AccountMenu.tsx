import Avatar from '@/components/ui/Avatar'
import Icon, { type IconName } from '@/components/ui/Icon'
import Tooltip from '@/components/ui/Tooltip'
import { getInitials } from '@/lib/get-initials'
import type { StaffUser } from './resolvers'

type AccountMenuProps = {
  user: StaffUser
  isOpen: boolean
  onToggle: () => void
}

type AccountOption = {
  label: string
  icon: IconName
}

const ACCOUNT_OPTIONS: AccountOption[] = [
  { label: 'Mi perfil', icon: 'user-round' },
  { label: 'Configuración de la cuenta', icon: 'settings' },
]

const MENU_ID = 'account-menu'

export default function AccountMenu({ user, isOpen, onToggle }: AccountMenuProps) {
  const initials = getInitials(user.name)

  return (
    <div className="relative border-l border-line-soft pl-3">
      <Tooltip content={user.name}>
        {(describedById) => (
          <button
            type="button"
            onClick={onToggle}
            aria-label="Cuenta"
            aria-describedby={describedById}
            aria-expanded={isOpen}
            aria-controls={MENU_ID}
            className={`flex cursor-pointer items-center justify-center rounded-avatar border-0 bg-transparent p-0 ${isOpen ? 'ring-2 ring-green' : ''}`}
          >
            <Avatar initials={initials} size={32} />
          </button>
        )}
      </Tooltip>
      {isOpen && (
        <div
          id={MENU_ID}
          className="absolute top-[calc(100%+8px)] right-0 max-h-[calc(100dvh-76px)] w-[262px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-card border border-line bg-card p-1.5 shadow-menu"
        >
          <div className="flex items-center gap-2.5 px-2.5 pt-2.5 pb-3">
            <Avatar initials={initials} size={32} />
            <div className="min-w-0">
              <p className="truncate font-head text-[13.5px] font-semibold text-ink">{user.name}</p>
              <p className="truncate text-[11.5px] text-sub">{user.roleLabel}</p>
            </div>
          </div>
          <div className="border-t border-line-soft pt-1.5">
            {ACCOUNT_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                disabled
                className="mb-0.5 flex w-full cursor-not-allowed items-center gap-2.5 rounded-control border-0 bg-transparent px-2.5 py-[9px] text-left font-body text-[13.5px] text-ink opacity-50"
              >
                <span className="text-sub">
                  <Icon name={option.icon} size={15} />
                </span>
                <span className="min-w-0 flex-1">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
