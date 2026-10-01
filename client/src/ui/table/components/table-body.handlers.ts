import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableBodyProps = ComponentProps<'tbody'>

export default function useTableBody({ className, ...rest }: TableBodyProps) {
  return { bodyProps: { ...rest, className: cn('[&_tr:last-child>*]:border-b-0', className) } }
}
