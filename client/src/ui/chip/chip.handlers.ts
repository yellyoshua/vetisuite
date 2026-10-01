import type { ComponentProps, MouseEvent } from 'react'
import { cn } from '@/lib/utils'

export type ChipVariant = 'neutral' | 'primary' | 'destructive' | 'info'

export type ChipProps = ComponentProps<'span'> & {
  variant?: ChipVariant
  label: string
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void
}

const variantClasses: Record<ChipVariant, string> = {
  neutral: 'border-border text-muted-foreground',
  primary: 'border-primary/30 text-primary',
  destructive: 'border-danger/30 text-danger',
  info: 'border-info/30 text-info',
}

export default function useChip({ variant = 'neutral', label, onRemove, className, ...rest }: ChipProps) {
  const chipClassName = cn(
    'inline-flex items-center gap-1 h-6 rounded-sm border bg-card px-1.5 text-xs leading-none font-medium whitespace-nowrap',
    variantClasses[variant],
    className,
  )

  return {
    label,
    chipProps: { ...rest, className: chipClassName },
    removeProps: onRemove
      ? {
          type: 'button' as const,
          'aria-label': `Quitar ${label}`,
          onClick: onRemove,
          className: '-my-1 -mr-1 inline-flex size-3.5 cursor-pointer items-center justify-center rounded-sm opacity-70 transition-opacity duration-150 ease-out-expo motion-reduce:transition-none hover:opacity-100 [&_svg]:size-3',
        }
      : null,
  }
}
