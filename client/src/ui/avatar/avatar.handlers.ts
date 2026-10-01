import { useState, type ComponentProps } from 'react'
import { cn, getInitials } from '@/lib/utils'

export type AvatarSize = 'sm' | 'md' | 'lg'

export type AvatarProps = Omit<ComponentProps<'span'>, 'children'> & {
  name: string
  src?: string
  size?: AvatarSize
}

const sizePixels: Record<AvatarSize, number> = {
  sm: 28,
  md: 32,
  lg: 40,
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'size-7 text-[10px]',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
}

export default function useAvatar({ name, src, size = 'md', className, ...rest }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined)
  const showImage = Boolean(src) && failedSrc !== src

  return {
    rootProps: {
      ...rest,
      role: showImage ? undefined : 'img',
      'aria-label': showImage ? undefined : name,
      className: cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border font-medium text-muted-foreground select-none',
        sizeClasses[size],
        className,
      ),
    },
    showImage,
    imageProps: {
      src,
      alt: name,
      width: sizePixels[size],
      height: sizePixels[size],
      loading: 'lazy' as const,
      className: 'size-full object-cover',
      onError: () => setFailedSrc(src),
    },
    initials: getInitials(...name.split(/\s+/)),
  }
}
