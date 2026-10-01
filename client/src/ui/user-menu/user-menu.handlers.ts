import type { ComponentProps } from 'react'
import { cn, getInitials } from '@/lib/utils'

export type UserMenuStatus = 'online' | 'away' | 'offline'

export type UserMenuProps = Omit<ComponentProps<'button'>, 'children'> & {
  name: string
  email: string
  status?: UserMenuStatus
}

const statusClasses: Record<UserMenuStatus, string> = {
  online: 'bg-primary',
  away: 'bg-warning',
  offline: 'bg-neutral-faint',
}

const statusLabels: Record<UserMenuStatus, string> = {
  online: 'En línea',
  away: 'Ausente',
  offline: 'Desconectado',
}

export default function useUserMenu({ name, email, status = 'online', type = 'button', className, ...rest }: UserMenuProps) {
  return {
    name,
    email,
    initials: getInitials(...name.split(/\s+/)),
    statusText: statusLabels[status],
    buttonProps: {
      ...rest,
      type,
      className: cn(
        'flex w-full min-w-0 cursor-pointer touch-manipulation items-center gap-2 rounded-card border border-border bg-card py-2 pr-2.5 pl-2 text-left shadow-lift transition-[border-color] duration-150 ease-out-expo hover:border-muted-foreground/40 motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-50 dark:shadow-none',
        className,
      ),
    },
    avatarClassName: 'relative inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground',
    dotClassName: cn('absolute right-0 bottom-0 size-2 rounded-full ring-2 ring-card', statusClasses[status]),
    textClassName: 'flex min-w-0 flex-1 flex-col gap-1',
    nameClassName: 'truncate text-sm leading-none font-medium text-foreground',
    emailClassName: 'truncate text-xs leading-none text-neutral-faint',
    chevronClassName: 'size-4 shrink-0 text-muted-foreground',
  }
}
