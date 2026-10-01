import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type GridCols = 1 | 2 | 3 | 4 | 6
export type GridGap = 'sm' | 'md' | 'lg'

export type GridProps = ComponentProps<'div'> & {
  cols?: GridCols
  gap?: GridGap
}

const colsClasses: Record<GridCols, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
}

const gapClasses: Record<GridGap, string> = {
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
}

export default function useGrid({ cols = 3, gap = 'md', className, ...rest }: GridProps) {
  return { gridProps: { ...rest, className: cn('grid', colsClasses[cols], gapClasses[gap], className) } }
}
