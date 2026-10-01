import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type SeparatorOrientation = 'horizontal' | 'vertical'

export type SeparatorProps = ComponentProps<'div'> & {
  orientation?: SeparatorOrientation
  decorative?: boolean
}

const orientationClasses: Record<SeparatorOrientation, string> = {
  horizontal: 'h-px w-full',
  vertical: 'w-px self-stretch',
}

export default function useSeparator({ orientation = 'horizontal', decorative = false, className, ...rest }: SeparatorProps) {
  return {
    separatorProps: {
      ...rest,
      role: decorative ? ('none' as const) : ('separator' as const),
      'aria-orientation': decorative ? undefined : orientation,
      className: cn('shrink-0 bg-border', orientationClasses[orientation], className),
    },
  }
}
