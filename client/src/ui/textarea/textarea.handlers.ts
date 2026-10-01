import type { ChangeEvent, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = ComponentProps<'textarea'> & {
  onValueChange?: (value: string) => void
}

export default function useTextarea({ onValueChange, onChange, className, ...rest }: TextareaProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(event)
    onValueChange?.(event.target.value)
  }

  const textareaClassName = cn(
    'flex min-h-20 w-full min-w-0 px-2.5 py-2 leading-normal rounded-control border border-border bg-card text-[13px] text-foreground shadow-lift transition-[color,border-color,box-shadow] duration-150 ease-out-expo motion-reduce:transition-none placeholder:text-muted-foreground hover:border-muted-foreground/40 focus:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border aria-invalid:border-danger dark:shadow-none',
    className,
  )

  return { textareaProps: { ...rest, onChange: handleChange, className: textareaClassName } }
}
