import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type FramedCardProps = Omit<ComponentProps<'section'>, 'title'> & {
  title: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  bodyClassName?: string
}

export default function useFramedCard({ title, icon, actions, bodyClassName, className, children, ...rest }: FramedCardProps) {
  const titleId = useId()

  return {
    title,
    icon,
    actions,
    children,
    titleId,
    rootProps: {
      ...rest,
      'aria-labelledby': rest['aria-label'] ? undefined : titleId,
      className: cn('relative isolate flex min-w-0 flex-col overflow-hidden rounded-card bg-neutral-frame p-1 ring-1 ring-border ring-inset', className),
    },
    stripesClassName: 'pointer-events-none absolute inset-0 -z-10 bg-stripes',
    headerClassName: 'flex min-h-8 items-center justify-between gap-2 p-2',
    titleClassName: 'truncate font-body text-sm leading-none font-medium text-muted-foreground',
    iconClassName: 'flex shrink-0 items-center gap-1 text-muted-foreground [&_svg]:size-4',
    bodyClassName: cn('min-w-0 flex-1 rounded-row border border-border bg-card p-3', bodyClassName),
  }
}
