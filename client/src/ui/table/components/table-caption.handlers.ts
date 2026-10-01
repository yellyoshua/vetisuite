import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TableCaptionProps = ComponentProps<'caption'>

export default function useTableCaption({ className, ...rest }: TableCaptionProps) {
  return { captionProps: { ...rest, className: cn('mt-3 px-3 pb-3 text-left text-xs text-muted-foreground', className) } }
}
