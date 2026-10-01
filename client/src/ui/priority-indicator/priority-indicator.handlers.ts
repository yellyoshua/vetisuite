import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type PriorityLevel = 'alta' | 'media' | 'baja'

export type PriorityIndicatorProps = Omit<ComponentProps<'span'>, 'children'> & {
  level: PriorityLevel
  label?: string
}

const filled: Record<PriorityLevel, number> = { alta: 3, media: 2, baja: 1 }

const fillClasses: Record<PriorityLevel, string> = {
  alta: 'bg-danger',
  media: 'bg-warning',
  baja: 'bg-warning/60',
}

const barHeights = ['h-1.5', 'h-[9px]', 'h-3']

export default function usePriorityIndicator({ level, label, className, ...rest }: PriorityIndicatorProps) {
  return {
    label: label ?? level,
    rootProps: {
      ...rest,
      className: cn('inline-flex shrink-0 items-center gap-2 text-[13px] leading-none font-medium whitespace-nowrap text-foreground', className),
    },
    barsClassName: 'flex h-3 items-end gap-0.5',
    bars: barHeights.map((height, index) => ({
      key: height,
      className: cn('w-[3px] rounded-full', height, index < filled[level] ? fillClasses[level] : 'bg-border'),
    })),
  }
}
