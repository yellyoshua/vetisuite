import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StatCardTone = 'primary' | 'destructive' | 'warning' | 'info'

export type StatCardProps = Omit<ComponentProps<'div'>, 'title'> & {
  title: ReactNode
  value: ReactNode
  unit?: ReactNode
  delta?: number | string
  deltaLabel?: string
  icon?: ReactNode
  tone?: StatCardTone
}

const toneClasses: Record<StatCardTone, string> = {
  primary: 'text-primary',
  destructive: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
}

const swatchClasses: Record<StatCardTone, string> = {
  primary: 'bg-primary',
  destructive: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
}

function formatDelta(delta: number | string) {
  if (typeof delta === 'string') return { text: delta, negative: /^[-−]/.test(delta.trim()) }
  return { text: `${delta > 0 ? '+' : delta < 0 ? '−' : ''}${Math.abs(delta)}%`, negative: delta < 0 }
}

export default function useStatCard({
  title,
  value,
  unit,
  delta,
  deltaLabel = 'vs semana pasada',
  icon,
  tone = 'primary',
  className,
  ...rest
}: StatCardProps) {
  const titleId = useId()
  const formatted = delta === undefined ? undefined : formatDelta(delta)

  return {
    rootProps: {
      role: 'group' as const,
      'aria-labelledby': rest['aria-label'] ? undefined : titleId,
      ...rest,
      className: cn('relative isolate flex min-w-0 flex-col overflow-hidden rounded-card bg-neutral-frame p-1 ring-1 ring-border ring-inset', className),
    },
    title,
    titleId,
    value,
    unit,
    icon,
    deltaLabel,
    stripesClassName: 'pointer-events-none absolute inset-0 -z-10 bg-stripes',
    headerClassName: 'flex min-h-8 items-center justify-between gap-2 p-2',
    titleClassName: 'truncate text-sm leading-none font-medium text-muted-foreground',
    iconClassName: cn('flex shrink-0 [&_svg]:size-4', toneClasses[tone]),
    swatchClassName: cn('size-2 shrink-0 rounded-full', swatchClasses[tone]),
    bodyClassName: 'flex min-w-0 flex-1 flex-col gap-1.5 rounded-row border border-border bg-card p-3',
    rowClassName: 'flex min-w-0 items-baseline gap-1.5',
    valueClassName: 'truncate text-2xl leading-tight font-medium text-foreground tabular-nums',
    unitClassName: 'text-[13px] text-muted-foreground',
    footClassName: 'truncate text-xs text-muted-foreground',
    delta: formatted && {
      text: formatted.text,
      className: cn('font-medium tabular-nums', formatted.negative ? 'text-danger' : 'text-primary'),
    },
  }
}
