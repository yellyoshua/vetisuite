import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type PageHeaderProps = Omit<ComponentProps<'header'>, 'title' | 'children'> & {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  breadcrumb?: ReactNode
}

export default function usePageHeader({ title, subtitle, actions, breadcrumb, className, ...rest }: PageHeaderProps) {
  return {
    title,
    subtitle,
    actions,
    breadcrumb,
    rootProps: { ...rest, className: cn('flex min-w-0 flex-col gap-4', className) },
    rowClassName: 'flex min-w-0 flex-wrap items-end justify-between gap-3',
    textClassName: 'flex min-w-0 flex-col gap-1.5',
    titleClassName: 'font-head text-2xl leading-tight font-medium text-balance text-foreground',
    subtitleClassName: 'text-[13px] text-muted-foreground',
    actionsClassName: 'flex shrink-0 flex-wrap items-center gap-2',
  }
}
