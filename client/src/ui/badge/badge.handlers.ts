import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant = 'primary' | 'secondary' | 'outline' | 'muted' | 'destructive'
export type BadgeSize = 'sm' | 'md'

export type BadgeProps = ComponentProps<'span'> & {
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'border-border bg-card text-primary',
  secondary: 'border-border bg-neutral-frame text-muted-foreground',
  outline: 'border-border bg-card text-muted-foreground',
  muted: 'border-transparent bg-muted text-muted-foreground',
  destructive: 'border-border bg-card text-danger',
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-[3px] text-[10px]',
  md: 'h-6 px-2 text-xs',
}

export default function useBadge({ variant = 'secondary', size = 'md', className, ...rest }: BadgeProps) {
  const badgeClassName = cn(
    'inline-flex shrink-0 items-center gap-1 rounded-control border leading-none font-medium whitespace-nowrap [&_svg]:size-3',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )

  return { badgeProps: { ...rest, className: badgeClassName } }
}
