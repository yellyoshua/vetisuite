import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ActivityFeedTone = 'primary' | 'info' | 'warning' | 'destructive' | 'muted'

export type ActivityFeedItem = {
  id: string
  title: ReactNode
  description: ReactNode
  time: string
  dateTime: string
  icon: ReactNode
  tone: ActivityFeedTone
}

export type ActivityFeedProps = Omit<ComponentProps<'ol'>, 'children'> & {
  items: ActivityFeedItem[]
}

const toneClasses: Record<ActivityFeedTone, string> = {
  primary: 'text-primary',
  info: 'text-info',
  warning: 'text-warning',
  destructive: 'text-danger',
  muted: 'text-muted-foreground',
}

export default function useActivityFeed({ items, className, ...rest }: ActivityFeedProps) {
  const lastIndex = items.length - 1

  return {
    listProps: { ...rest, className: cn('flex flex-col border-t border-dashed border-border pt-3', className) },
    items: items.map((item, index) => ({
      ...item,
      itemClassName: 'relative flex min-w-0 gap-3 pb-4 last:pb-0',
      connectorClassName: index === lastIndex ? undefined : 'absolute top-9 bottom-1 left-4 border-l border-dashed border-border',
      iconClassName: cn(
        'flex size-8 shrink-0 items-center justify-center rounded-control border border-border bg-card [&_svg]:size-4',
        toneClasses[item.tone],
      ),
    })),
    bodyClassName: 'flex min-w-0 flex-1 flex-col gap-1 pt-1',
    headClassName: 'flex min-w-0 items-baseline justify-between gap-3',
    titleClassName: 'min-w-0 truncate text-xs font-medium text-foreground',
    timeClassName: 'shrink-0 text-xs text-neutral-faint tabular-nums',
    descriptionClassName: 'text-xs text-neutral-faint [&_strong]:font-medium [&_strong]:text-foreground',
  }
}
