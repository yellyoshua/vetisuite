import { Link } from 'react-router'
import { LogOutIcon, UserRoundIcon } from 'lucide-react'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import useLogout from '@/hooks/use-logout'
import { getInitials } from '@/lib/utils'

export type AccountUser = {
  name: string
  roleLabel: string
}

export type AccountMenuProps = {
  user: AccountUser
  isOpen: boolean
  onToggle: () => void
}

const MENU_ID = 'account-menu'

const OPTION_CLASS_NAME = 'mb-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-control border-0 bg-transparent px-2.5 py-[9px] text-left font-body text-[13.5px] text-ink hover:bg-line-soft disabled:cursor-not-allowed disabled:opacity-50'

export default function AccountMenu({ user, isOpen, onToggle }: AccountMenuProps) {
  const initials = getInitials(...user.name.split(' '))
  const [isLoggingOut, logout] = useLogout()

  return (
    <div className="relative border-l border-line-soft pl-3">
      <CustomTooltip content={user.name}>
          <button
            type="button"
            onClick={onToggle}
            aria-label="Cuenta"
            aria-expanded={isOpen}
            aria-controls={MENU_ID}
            className={`flex cursor-pointer items-center justify-center rounded-avatar border-0 bg-transparent p-0 ${isOpen ? 'ring-2 ring-green' : ''}`}
          >
            <AccountAvatar initials={initials} />
          </button>
      </CustomTooltip>
      {isOpen && (
        <div
          id={MENU_ID}
          className="absolute top-[calc(100%+8px)] right-0 max-h-[calc(100dvh-76px)] w-[262px] max-w-[calc(100vw-32px)] overflow-y-auto rounded-card border border-line bg-card p-1.5 shadow-menu"
        >
          <div className="flex items-center gap-2.5 px-2.5 pt-2.5 pb-3">
            <AccountAvatar initials={initials} />
            <div className="min-w-0">
              <p className="truncate font-head text-[13.5px] font-semibold text-ink">{user.name}</p>
              <p className="truncate text-[11.5px] text-sub">{user.roleLabel}</p>
            </div>
          </div>
          <div className="border-t border-line-soft pt-1.5">
            <Link to="/profile" onClick={onToggle} className={OPTION_CLASS_NAME}>
              <span className="text-sub">
                <UserRoundIcon className="size-[15px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">Mi perfil</span>
            </Link>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => logout()}
              className={OPTION_CLASS_NAME}
            >
              <span className="text-sub">
                <LogOutIcon className="size-[15px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AccountAvatar({ initials }: { initials: string }) {
  return (
    <Avatar className="rounded-avatar">
      <AvatarFallback className="rounded-avatar bg-green-soft text-xs font-semibold text-green">{initials}</AvatarFallback>
    </Avatar>
  )
}
