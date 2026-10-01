import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableEmptyProps = ComponentProps<'td'> & {
  colSpan: number
}

export default function useTableEmpty({ className, children = 'Sin resultados', ...rest }: TableEmptyProps) {
  return {
    cellProps: { ...rest, children, className: cn('h-24 border-b border-border bg-card px-3 text-center text-[13px] text-muted-foreground', className) },
  }
}
