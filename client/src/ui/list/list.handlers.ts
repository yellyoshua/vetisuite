import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type ListVariant = 'plain' | 'divided' | 'bordered'

export type ListProps = ComponentProps<'ul'> & {
  variant?: ListVariant
}

export type ListItemProps = ComponentProps<'li'>

const variantClasses: Record<ListVariant, string> = {
  plain: 'flex flex-col gap-1',
  divided: 'flex flex-col divide-y divide-dashed divide-border',
  bordered: 'flex flex-col divide-y divide-border overflow-hidden rounded-row border border-border bg-card',
}

export default function useList({ variant = 'divided', className, ...rest }: ListProps) {
  return { listProps: { ...rest, className: cn(variantClasses[variant], className) } }
}

export function listItemClassName(className?: string) {
  return cn('flex min-h-11 min-w-0 items-center gap-3 px-3 py-2.5 text-[13px] text-foreground', className)
}
