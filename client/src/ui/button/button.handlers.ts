import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-muted text-foreground hover:bg-accent',
  outline: 'border border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground',
  ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
  destructive: 'bg-danger text-primary-foreground hover:bg-danger/90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-xs',
  md: 'h-8 px-2.5 text-[13px]',
  lg: 'h-9 px-3.5 text-sm',
  icon: 'size-8',
}

export default function useButton({ variant = 'primary', size = 'md', type = 'button', className, ...rest }: ButtonProps) {
  const buttonClassName = cn(
    'inline-flex shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-1.5 rounded-control leading-none font-medium whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 ease-out-expo active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )

  return { buttonProps: { ...rest, type, className: buttonClassName } }
}
