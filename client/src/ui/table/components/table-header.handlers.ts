import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableHeaderProps = ComponentProps<'thead'>

export default function useTableHeader({ className, ...rest }: TableHeaderProps) {
  return { headerProps: { ...rest, className: cn('[&_th]:sticky [&_th]:top-0', className) } }
}
