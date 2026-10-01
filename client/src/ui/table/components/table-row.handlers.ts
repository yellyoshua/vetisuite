import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableRowProps = ComponentProps<'tr'>

export default function useTableRow({ className, ...rest }: TableRowProps) {
  return { rowProps: { ...rest, className: cn('group', className) } }
}
