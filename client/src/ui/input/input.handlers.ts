import type { ChangeEvent, ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type InputProps = ComponentProps<'input'> & {
  onValueChange?: (value: string) => void
}

export default function useInput({ onValueChange, onChange, className, ...rest }: InputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event)
    onValueChange?.(event.target.value)
  }

  const inputClassName = cn(
    'flex h-8 w-full min-w-0 pr-2 pl-2.5 rounded-control border border-border bg-card text-[13px] text-foreground shadow-lift transition-[color,border-color,box-shadow] duration-150 ease-out-expo motion-reduce:transition-none placeholder:text-muted-foreground hover:border-muted-foreground/40 focus:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border aria-invalid:border-danger dark:shadow-none file:border-0 file:bg-transparent file:text-[13px] file:font-medium',
    className,
  )

  return { inputProps: { ...rest, onChange: handleChange, className: inputClassName } }
}
