import { ChevronsUpDown } from 'lucide-react'
import useUserMenu, { type UserMenuProps } from './user-menu.handlers'

export default function UserMenu(props: UserMenuProps) {
  const u = useUserMenu(props)

  return (
    <button {...u.buttonProps}>
      <span aria-hidden="true" className={u.avatarClassName}>
        {u.initials}
        <span className={u.dotClassName} />
      </span>
      <span className={u.textClassName}>
        <span className={u.nameClassName}>{u.name}</span>
        <span className={u.emailClassName}>{u.email}</span>
      </span>
      <span className="sr-only">, {u.statusText}</span>
      <ChevronsUpDown aria-hidden="true" className={u.chevronClassName} />
    </button>
  )
}
