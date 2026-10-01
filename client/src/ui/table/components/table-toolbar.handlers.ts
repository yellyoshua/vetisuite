import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TableToolbarProps = Omit<ComponentProps<'div'>, 'title'> & {
  title: ReactNode
  icon?: ReactNode
  search?: ReactNode
  actions?: ReactNode
}

export default function useTableToolbar({ title, icon, search, actions, className, ...rest }: TableToolbarProps) {
  return {
    title,
    icon,
    search,
    actions,
    rootProps: { ...rest, className: cn('flex flex-wrap items-center justify-between gap-2 p-2', className) },
    titleClassName: 'flex min-w-0 items-center gap-2 font-body text-sm font-medium text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0',
    controlsClassName: 'flex min-w-0 flex-wrap items-center gap-2',
  }
}
