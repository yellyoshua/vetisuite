import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type LabelProps = ComponentProps<'label'> & {
  required?: boolean
}

export default function useLabel({ required = false, className, ...rest }: LabelProps) {
  const labelClassName = cn(
    'flex items-center gap-1 text-[13px] leading-none font-medium text-muted-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
    className,
  )

  return { required, labelProps: { ...rest, className: labelClassName } }
}
