import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ToolbarProps = ComponentProps<'div'> & {
  start?: ReactNode
  end?: ReactNode
}

export default function useToolbar({ start, end, children, className, ...rest }: ToolbarProps) {
  return {
    start,
    end,
    children,
    rootProps: {
      ...rest,
      className: cn('flex min-h-12 min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-card p-2 text-[13px]', className),
    },
    startClassName: 'flex min-w-0 flex-1 items-center gap-2',
    endClassName: 'flex max-w-full min-w-0 items-center gap-2 overflow-x-auto',
  }
}
